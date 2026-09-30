"""
FlightGlobe AI Copilot — Python FastAPI Microservice
Uses google-genai SDK with strict JSON schema output enforcement.
Runs on port 8000, proxied by the Node.js server at /api/agent/chat.
"""

import os
import json
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are Nimbus, the FlightGlobe Autonomous AI Copilot.
You are integrated into a real flight booking platform with live GDS data.
Your job is to understand what the user wants and respond with a JSON action object.

You MUST return ONLY valid JSON matching this exact schema:
{
  "intent": "search_flights" | "book_flight" | "cancel_booking" | "change_currency" | "navigate_view" | "chat",
  "parameters": {
    "origin": "3-letter IATA code (e.g. DEL, BOM, JFK, LHR)",
    "destination": "3-letter IATA code",
    "date": "YYYY-MM-DD or null",
    "currency": "USD" | "EUR" | "INR" | "GBP" | "AED" | null,
    "targetView": "booking" | "radar" | "explore" | "passport" | null,
    "bookingId": "booking ID string or null",
    "airline": "Airline name or null",
    "seat": "Seat like 12A or null"
  },
  "reply": "A short, friendly, professional response confirming what you are doing."
}

City to IATA mapping examples:
- Delhi / New Delhi -> DEL
- Mumbai / Bombay -> BOM  
- Bangalore / Bengaluru -> BLR
- Chennai / Madras -> MAA
- Kolkata / Calcutta -> CCU
- Hyderabad -> HYD
- Goa -> GOI
- London -> LHR
- New York -> JFK
- Dubai -> DXB
- Singapore -> SIN
- Tokyo -> NRT
- Paris -> CDG
- Frankfurt -> FRA
- Sydney -> SYD

Rules:
1. For flight search requests, ALWAYS set intent="search_flights" and extract origin/destination.
2. For navigation ("show me radar", "go to my passes"), set intent="navigate_view".
3. For currency changes ("switch to INR", "show prices in rupees"), set intent="change_currency".
4. For general questions (no action needed), set intent="chat".
5. Always map city names correctly to their IATA codes.
6. If the user says "today" for date, use today's date: """ + __import__('datetime').date.today().isoformat() + """
"""

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryItem]] = []

IATA_ALIASES = {
    "delhi": "DEL", "new delhi": "DEL", "ndls": "DEL",
    "mumbai": "BOM", "bombay": "BOM",
    "bangalore": "BLR", "bengaluru": "BLR",
    "chennai": "MAA", "madras": "MAA",
    "kolkata": "CCU", "calcutta": "CCU",
    "hyderabad": "HYD",
    "goa": "GOI",
    "ahmedabad": "AMD",
    "pune": "PNQ",
    "jaipur": "JAI",
    "kochi": "COK", "cochin": "COK",
    "amritsar": "ATQ",
    "london": "LHR",
    "new york": "JFK", "nyc": "JFK",
    "dubai": "DXB",
    "singapore": "SIN",
    "tokyo": "NRT",
    "paris": "CDG",
    "frankfurt": "FRA",
    "sydney": "SYD",
    "toronto": "YYZ",
    "bangkok": "BKK",
    "hong kong": "HKG",
    "amsterdam": "AMS",
    "chicago": "ORD",
    "los angeles": "LAX",
    "san francisco": "SFO",
    "kuala lumpur": "KUL",
    "jakarta": "CGK",
    "doha": "DOH",
    "abu dhabi": "AUH",
}

def resolve_iata(city: str) -> Optional[str]:
    if not city:
        return None
    city = city.strip()
    if len(city) == 3 and city.isalpha():
        return city.upper()
    return IATA_ALIASES.get(city.lower())

@app.get("/health")
def health():
    return {"status": "ok", "service": "FlightGlobe Python AI Agent"}

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        contents = []
        for h in (req.history or []):
            role = "model" if h.role in ("assistant", "model") else "user"
            contents.append(types.Content(role=role, parts=[types.Part(text=h.content)]))
        contents.append(types.Content(role="user", parts=[types.Part(text=req.message)]))

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        raw = response.text.strip()
        parsed = json.loads(raw)

        intent = parsed.get("intent", "chat")
        params = parsed.get("parameters", {})
        reply = parsed.get("reply", "How can I help you?")

        client_actions = []

        if intent == "search_flights":
            origin = params.get("origin") or resolve_iata(params.get("origin", "")) or "DEL"
            destination = params.get("destination") or resolve_iata(params.get("destination", "")) or "BOM"
            client_actions.append({
                "type": "SET_ROUTE",
                "origin": origin,
                "destination": destination,
            })
            client_actions.append({
                "type": "NAVIGATE",
                "path": "/booking",
                "origin": origin,
                "destination": destination,
            })

        elif intent == "change_currency":
            currency = params.get("currency", "USD")
            client_actions.append({"type": "SET_CURRENCY", "currency": currency})

        elif intent == "navigate_view":
            view = params.get("targetView", "explore")
            client_actions.append({"type": "SWITCH_VIEW", "view": view})

        elif intent == "book_flight":
            origin = params.get("origin", "DEL")
            destination = params.get("destination", "LHR")
            client_actions.append({"type": "SET_ROUTE", "origin": origin, "destination": destination})
            client_actions.append({"type": "NAVIGATE", "path": "/booking", "origin": origin, "destination": destination})

        elif intent == "cancel_booking":
            booking_id = params.get("bookingId")
            if booking_id:
                client_actions.append({"type": "BOOKING_CANCELLED", "bookingId": booking_id})

        return JSONResponse({
            "status": "ok",
            "reply": reply,
            "clientActions": client_actions,
        })

    except json.JSONDecodeError as e:
        return JSONResponse({
            "status": "ok",
            "reply": f"I understood your request but had trouble formatting a response. Could you rephrase?",
            "clientActions": [],
        })
    except Exception as e:
        print(f"[AI Agent Error] {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)},
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
