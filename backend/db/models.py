import datetime
import json
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
import enum
from backend.db.database import Base, engine, settings

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"

class ProjectStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PLANNING = "PLANNING"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"

class SiteStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    MONITORING = "MONITORING"
    RESTORATION = "RESTORATION"
    INACTIVE = "INACTIVE"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(20), default=UserRole.ANALYST.value, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    last_login = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(String(100), nullable=False, default="Forestry")
    status = Column(String(50), default=ProjectStatus.ACTIVE.value, nullable=False)
    country = Column(String(100), nullable=False, default="Global")
    region = Column(String(100), nullable=False, default="Default Region")
    total_area = Column(Float, default=0.0)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")

class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    # Stored as GeoJSON dictionary (compatible with PostGIS ST_AsGeoJSON & SQLite)
    geometry = Column(JSON, nullable=False)
    area_hectares = Column(Float, default=0.0)
    status = Column(String(50), default=SiteStatus.ACTIVE.value, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="sites")
    analytics = relationship("Analytics", back_populates="site", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="site", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="site", cascade="all, delete-orphan")

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(String(36), primary_key=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    carbon_stock = Column(Float, default=0.0)  # tCO2e / ha
    carbon_sequestration = Column(Float, default=0.0)  # tCO2e / yr
    biodiversity_score = Column(Float, default=0.0)  # 0 - 100
    tree_cover_percentage = Column(Float, default=0.0)  # %
    biomass = Column(Float, default=0.0)  # Mg/ha
    rainfall = Column(Float, default=0.0)  # mm/yr
    temperature = Column(Float, default=0.0)  # Celsius

    site = relationship("Site", back_populates="analytics")

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(String(36), primary_key=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=False, index=True)
    analysis_type = Column(String(100), nullable=False)
    input_snapshot = Column(JSON, nullable=True)
    result = Column(JSON, nullable=False)
    model_name = Column(String(100), default="Darukaa AI Grounded LLM")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    site = relationship("Site", back_populates="ai_analyses")

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(String(36), primary_key=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(String(50), nullable=False)  # Low, Moderate, High
    model_version = Column(String(50), default="PyTorch EnvironmentalRiskNet v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    site = relationship("Site", back_populates="risk_predictions")
