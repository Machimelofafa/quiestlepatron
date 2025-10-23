#!/usr/bin/env python3
"""
Convenience script to run the simulation server
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 50)
    print("🎯 Qui est le Patron? - Serveur de simulation")
    print("=" * 50)
    print("\nDémarrage du serveur sur http://localhost:8000")
    print("Appuyez sur Ctrl+C pour arrêter\n")

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
