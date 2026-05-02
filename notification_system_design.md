# Stage 1 — Notification System Design

## How Priority Is Calculated

Each notification gets a single numeric **priority score** computed like this:

priority = TYPE_WEIGHT[type] + recency_score

# Type Weight

The type weight acts as the primary sorting key:

 Notification Type  Weight 
 Placement          300    
 Result             200    
 Event              100    

Placement always outranks Result, and Result always outranks Event — regardless of when they were sent.

# Recency Score

Raw Unix timestamps (seconds since epoch) are large numbers (around 1.7 billion). If we added them directly to the type weight, a slightly newer Event would outrank an older Placement, which breaks the business rule.

To fix this, recency is **normalized** to the range `[0, 99]` relative to the oldest and newest notifications in the current batch:

recency_score = ((epoch - min_epoch) / (max_epoch - min_epoch)) * 99

### Final Priority Score

priority = TYPE_WEIGHT[type] + recency_score
       
# How Continuous Incoming Notifications Are Handled

The API is stateless — it is polled on demand and returns the current list of notifications. The priority inbox re-ranks every time it runs.

# Strategy: Windowed Polling with Re-ranking

Every N seconds:
  1. Fetch latest notifications from API
  2. Deduplicate by ID (keep seen-ID set in memory)
  3. Compute priority scores for all notifications
  4. Keep only the top 10 in a min-heap (keyed by priority)
  5. Display or serve the heap contents


# Why a Min-Heap?

A **min-heap of size 10** gives O(log 10) ≈ O(1) insert time for each incoming notification:

- When a new notification arrives, compare its score to the heap's minimum.
- If the new score is greater, pop the minimum and push the new one.
- The heap always holds the 10 highest-priority notifications at any moment.

This avoids re-sorting the full list on every update — important when notifications arrive at high volume.

# Memory Management

- Seen IDs are stored in a `Set<string>` — lookup is O(1), and IDs are small strings.
- Old, already-processed IDs are never removed from the set (they act as a deduplication guard), which is safe since ID counts grow slowly compared to available memory.
- If memory becomes a concern in production, IDs can be expired after a configurable TTL (e.g., 24 hours).

# Polling Interval

A polling interval of **30 seconds** is a sensible default for campus notifications. For near-real-time delivery, the backend can switch to a **WebSocket or Server-Sent Events (SSE)** stream and apply the same heap logic as events arrive.

# Summary

Concern          Approach                                              

Primary sort key  Type weight (Placement > Result > Event)              
Secondary sort    Normalized recency [0–99] within the same type band   
Data structure    Min-heap of size N for O(log N) continuous updates    
Deduplication     In-memory Set of seen notification IDs                
Persistence       None required — API is the source of truth            
Logging           Custom file + stdout logger (no console.log) 
