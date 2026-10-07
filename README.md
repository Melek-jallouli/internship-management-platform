# Internship Management Platform

A full-stack internship management platform designed to
centralize internship applications, CV analysis, project
matching, supervision, evaluation and communication.

## Architecture

Frontend

- Angular
- TypeScript
- SCSS

Backend

- NestJS
- Node.js
- REST API

AI

- Python
- FastAPI
- NLP
- Sentence Transformers

Database

- MySQL

## Project Structure

frontend/ → Angular application
backend/ → NestJS REST API
ai/ → Python AI services

## Features

- User authentication
- Role-based access
- CV upload
- AI-powered CV analysis
- Project matching
- Internship management
- Supervisor task management
- Intern evaluation
- Messaging
- Administrative dashboard

## Getting Started

### Frontend

cd frontend
npm install
ng serve

### Backend

cd backend
npm install
npm run start:dev

### AI service

cd ai
pip install -r requirements.txt
uvicorn main:app --reload
