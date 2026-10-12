# Product Requirements Document (PRD)

## Overview

A mobile application that allows users to connect their WakaTime account and view
detailed coding activity, statistics, charts, projects, languages, editors, and
historical trends.

## Gate

Do not allow the coding agent to begin until this document exists.

## Testers

Me and a few friends will act as testers for the MVP.

## Scope: MVP

The MVP should contain only:

- WakaTime connection
- Today's total coding time
- Last seven days
- Last thirty days
- Language breakdown
- Project breakdown
- Editor breakdown
- Daily chart
- Refresh button
- Error handling
- Loading states
- Dark mode

The mobile app should initially be **read-only**.

## Out of Scope (Initially Excluded)

Do not initially build every possible WakaTime feature. Initially exclude:

- Sending heartbeats
- Creating a new WakaTime competitor
- Desktop tracking
- Team dashboards
- Social features
- Notifications
- Custom billing
- AI coding analytics
- Manual time editing

## Success Criteria

- A user can connect WakaTime in under two minutes.
- Today's total matches WakaTime's dashboard.
- Weekly language totals match WakaTime.
- The app works on Android.
- API failures show understandable messages.
- No secret key appears in the mobile bundle.
- A fresh install can be completed without developer tools.
