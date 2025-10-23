"""
FastAPI server for game simulation
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .simulator import Simulator, simulate_matches
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Qui est le Patron? Simulator")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    num_matches: int

    class Config:
        json_schema_extra = {
            "example": {
                "num_matches": 10
            }
        }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Qui est le Patron? Simulation API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/simulate")
async def simulate(request: SimulationRequest):
    """
    Run match simulations
    Returns CSV file with all match data
    """
    try:
        num_matches = request.num_matches

        # Validate input
        if num_matches < 1:
            raise HTTPException(status_code=400, detail="Number of matches must be at least 1")
        if num_matches > 1000:
            raise HTTPException(status_code=400, detail="Number of matches cannot exceed 1000")

        logger.info(f"Starting simulation of {num_matches} matches")

        # Run simulation
        csv_data = simulate_matches(num_matches)

        logger.info(f"Simulation completed successfully")

        # Return CSV file
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=simulation_{num_matches}_matches.csv"
            }
        )

    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
