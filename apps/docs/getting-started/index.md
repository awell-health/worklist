# Introduction to Panels

Welcome to the **Awell Panels Management System**! This tutorial will guide you through creating your first panel, connecting data sources, and building views step-by-step.

## What You'll Learn

By the end of this tutorial, you'll be able to:

1. 🏗️ **Set up your development environment** and install dependencies
2. 📊 **Create your first panel** with proper configuration
3. 🔌 **Connect data sources** to populate your panel with real data
4. 📋 **Add columns** both base (from data sources) and calculated (formulas)
5. 👀 **Build views** for different user perspectives
6. 📤 **Publish views** to share them with your team

## What is a Panel?

A **Panel** is a configurable data container that:
- Connects to multiple data sources (databases, APIs, files)
- Defines columns that structure your data
- Supports calculated columns with custom formulas
- Enables user-specific views with filtering and sorting
- Provides multi-tenant isolation for organizations

## Core Concepts

### Panels vs Views
- **Panels** define the data structure and sources
- **Views** are user-specific visualizations of panel data

### Base vs Calculated Columns
- **Base columns** come directly from data sources
- **Calculated columns** use formulas to derive new values

### Publishing System
- **Personal views** are private to individual users
- **Published views** are shared tenant-wide

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js 22+ installed
- ✅ pnpm 10.11+ package manager
- ✅ Basic TypeScript/JavaScript knowledge
- ✅ Understanding of REST APIs

## Example Scenario

Throughout this tutorial, we'll build a **User Management Panel** that:
- Connects to a user database
- Shows user information with email, name, status
- Calculates a "full name" from first/last name fields
- Creates different views for admins and regular users
- Publishes a standard "Active Users" view for the team

## Time Estimate

- ⏱️ **Total time**: ~30 minutes
- 🚀 **Quick start**: 10 minutes for basic panel
- 📈 **Complete tutorial**: 30 minutes for full features

## Ready to Start?

Let's begin by setting up your development environment!

[Next: Installation →](./installation) 