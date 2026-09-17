from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import User
from backend.schemas.agent import AgentQueryRequest, AgentQueryResponse
from backend.ai.agent import DarukaaAgent
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/agent", tags=["Agentic AI"])

@router.post("/query", response_model=AgentQueryResponse)
def agent_query_endpoint(
    req: AgentQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = DarukaaAgent(db)
    return agent.process_query(req.query)
