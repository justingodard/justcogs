# Product Requirements Document (PRD)

## 1. Overview

### 1.1 Product Name
Justcogs

### 1.2 Product Vision
Discogs, but for Justin

### 1.3 Product Goals
- Create a comprehensive digital catalog of my vinyl collection
- Enable easy discovery and exploration of new music based on my existing collection
- Build a personalized music management experience tailored to my needs

## 2. Problem Statement

While Discogs provides a comprehensive database for cataloging vinyl collections, it lacks a focused, mobile-first experience for personal collection management. The platform is designed for the broader marketplace and community, making it difficult to quickly browse, filter, and explore one's own collection. Additionally, there's no integrated way to access reviews from other music services, and the experience lacks engaging discovery mechanisms that make exploring a personal collection fun and serendipitous.

## 3. Solution

A mobile-first application that provides a focused, personalized view of my Discogs collection. The app will sync with my Discogs library via their API, offering intuitive filtering capabilities (especially by genre), integration with external music review APIs for richer context, and an engaging shake-to-random feature that surfaces unexpected albums from my collection for rediscovery.

### Key Features
- Focused mobile app view of my Discogs library
- Genre is a first-class attribute on albums and supports multiple values per album
- Filtering by genre is inclusive (albums may appear in multiple genre results)
- Filtering operates only on the user’s local collection, not remote queries
- Read reviews from external music APIs (e.g., Pitchfork, AllMusic, etc.)
- Shake-to-random feature for serendipitous discovery of albums in my collection
- Clean, distraction-free interface focused on personal collection browsing

## 3.1 Behavioral assumptions

The following assumptions define stable product behavior and should be treated as invariants unless explicitly revised:

- Albums may belong to multiple genres
- Genre values are treated as user-facing descriptors, not strict taxonomic classifications
- Discovery and filtering prioritize speed and local responsiveness over completeness
- The primary mode of interaction is browsing and narrowing, not complex query building
- Features should assume a single-user, personal collection context

## 4. Technical Notes

**Technology Stack**: [To be determined]

**Integrations**:
- Discogs API (for collection data)
- External music review API (e.g., Pitchfork, AllMusic, etc.)

## 5. Out of Scope

The following features are explicitly out of scope:
- Marketplace functionality
- Social/community features
- Collection editing (will use Discogs as source of truth)

## 6. Open Questions

- Which music review API to use?
- Native iOS app, React Native, or web app?
- How to handle offline access?
- Should filtering be saved/preferences?

