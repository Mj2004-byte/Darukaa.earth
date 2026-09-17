from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AgentQueryRequest(BaseModel):
    query: str

class ToolExecutionLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Any

class AgentQueryResponse(BaseModel):
    query: str
    final_answer: str
    tool_logs: List[ToolExecutionLog]
    data_points_used: int
