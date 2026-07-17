# 🛡️ SafeGuard Mobile Architecture & System Design

SafeGuard is an offline-first enterprise Health, Safety, and Environment (HSE) incident management mobile application.

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------+
|                      React Native / Expo                    |
|      (Reporter Screens, Investigator Dashboard, CAPA)       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Offline Layer                          |
|             (OfflineQueue, NetworkMonitor, Sync)            |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Supabase Backend                        |
|       (Auth, PostgREST Relational DB, S3 Object Storage)    |
+-------------------------------------------------------------+
```

---

## 📊 4 Pillars of Risk Evaluation

1. **People**: Personal injuries, medical treatments, lost time incidents (LTI).
2. **Assets**: Structural integrity, equipment breakdown, business interruption costs.
3. **Environment**: Hydrocarbon spills, emissions, hazardous waste containment.
4. **Reputation**: Regulatory penalties, community relations, brand exposure.
