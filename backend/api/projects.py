import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Project, User, UserRole
from backend.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from backend.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
def list_projects(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    project_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%") | Project.description.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(Project.status == status_filter.upper())
    if project_type:
        query = query.filter(Project.project_type == project_type)

    projects = query.order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        p_out = ProjectOut.model_validate(p)
        p_out.site_count = len(p.sites)
        results.append(p_out)
    return results

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    project = Project(
        id=str(uuid.uuid4()),
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        status=project_in.status,
        country=project_in.country,
        region=project_in.region,
        total_area=0.0,
        owner_id=current_user.id,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    p_out = ProjectOut.model_validate(project)
    p_out.site_count = 0
    return p_out

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    p_out = ProjectOut.model_validate(project)
    p_out.site_count = len(project.sites)
    return p_out

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    project.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(project)
    p_out = ProjectOut.model_validate(project)
    p_out.site_count = len(project.sites)
    return p_out

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
