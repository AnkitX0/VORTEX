🌾 Agri-Trust — A Fraud-Free Marketplace for Farmers
Team VORTEX

Agri-Trust is a secure P2P agricultural marketplace that connects farmers directly with buyers, eliminates middlemen, and prevents fraud using UPI escrow, GPS + photo proof, and real-time mandi price awareness.

🔐 Demo Login (No Database Required)

Use these credentials for the demo:

👨‍🌾 Farmer Login

Email: farmer@gmail.com

Password: 1234

🛒 Buyer Login

Email: buyer@gmail.com

Password: 1234

Admin module is disabled for the demo.

📌 Table of Contents

Overview

Features

Architecture Diagram

System Flow

Technology Stack

How Login Works

SQL Integration

Folder Structure

Roadmap

Team

🌱 1. Overview

Agri-Trust protects farmers from common mandi frauds:

Fake currency & delayed payments

Under-weighing and manipulation

Middlemen taking 20–50%

No delivery proof

No verified buyers

Zero market price transparency

We solve these using:

Direct farmer → buyer trade

Secure UPI escrow

GPS + photo verification

Real-time mandi price radar

Multi-language, low-tech interface

⚙️ 2. Features by User Role
👨‍🌾 Farmer Features

Create and manage listings

Upload delivery photo + GPS

Escrow-protected payments

Track orders & revenue

Live mandi prices

Notifications

🛒 Buyer Features

Browse farmer listings

Search & filter

Secure escrow payment

Track delivery

Download receipt

🛡️ Admin Features (Backend Only)

Resolve disputes

Verify proof of delivery

Manage users & listings

Fraud monitoring

🧩 3. Architecture Diagram
flowchart LR
  Farmer --> ListingService
  Buyer --> MarketplaceService

  ListingService --> DB[(SQL Database)]
  MarketplaceService --> OrderService

  OrderService --> Escrow[UPI Escrow Logic]
  DeliveryProofService --> OrderService

  Farmer --> DeliveryProofService
  DeliveryProofService --> Storage[(Cloud Storage)]

  AdminPortal --> OrderService
  AdminPortal --> DeliveryProofService

  MarketPriceService --> DB
  MarketPriceService --> MandiAPI[Agmarknet / e-NAM]


If GitHub doesn’t render Mermaid, it still shows clean as code.

🔄 4. System Flow
Farmer Flow

Login

Create listing

Buyer places order (Escrow Locked)

Deliver product

Upload GPS + Photo

Payment Released

Buyer Flow

Login

Browse listings

Place order (Escrow)

Wait for delivery

Receive confirmation & receipt

Admin Flow

Monitor all orders

Verify proofs

Approve/Reject cases

🧱 5. Technology Stack
Frontend

HTML

TailwindCSS

JavaScript

Fully responsive UI

Backend (Future Integration)

Node.js (Express microservices)

Auth / Orders / Listings / Prices / Notifications

Database

PostgreSQL / MySQL

Redis for caching

Integrations

Razorpay / Cashfree UPI Escrow

Agmarknet / e-NAM

Cloud Storage (S3/Cloudinary)

🔐 6. How Login Works (Demo Version)

Login is hardcoded in script.js:

if (email === "farmer@gmail.com" && pass === "1234") {
    window.location.href = "farmer.html";
}


No database

No hashing

No API calls

Purely for presentation/demo.

🗄️ 7. How It Will Work With SQL (Production)
Authentication

User enters credentials

Sent to Auth Service

SQL verifies hashed password

JWT issued

Listings SQL Schema
listings(
  id INT,
  farmer_id INT,
  crop VARCHAR,
  qty INT,
  price FLOAT,
  image_url TEXT,
  timestamp DATETIME
)

Orders + Escrow

Order Service contacts UPI Escrow API

SQL stores order + txn ID

DeliveryProofService updates order status

Delivery Proof

Photo → Cloud Storage

GPS + timestamp → SQL

📁 8. Folder Structure
/agri-trust-demo
│── index.html
│── farmer.html
│── buyer.html
│── style.css
│── script.js
└── assets/

🚀 9. Roadmap
Phase	Feature
1	Full demo UI
2	Backend APIs
3	SQL database
4	UPI Escrow Integration
5	Mandi Price Aggregation
6	Offline Mode + Multi-language
7	ML Price Prediction
👥 10. Team VORTEX

Ankit Singh — Frontend & AI/ML

Shresth Prakash — Backend Engineering

Aparupa Samal — Data & Insights

Bhoomi Yadav — Field Research & UX
