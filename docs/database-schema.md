# CivicPulse AI — Database Schema

## Entity Relationship Overview

```
Users ──────────────────────────────────────────────────────────
  │                                                              │
  ├── CitizenProfile (1:1)                                       │
  │     └── Complaints (1:N)                                     │
  │           ├── ComplaintAttachments (1:N)                     │
  │           ├── ComplaintHistory (1:N)                         │
  │           ├── Feedback (1:1)                                 │
  │           └── Notifications (1:N)                           │
  │                                                              │
  ├── OfficerProfile (1:1)                                       │
  │     └── Department (N:1)                                     │
  │                                                              │
  └── AuditLogs (1:N)                                           │
                                                                 │
Departments ─────────────────────────────────────────────────────
  └── Complaints (1:N)

Analytics ───────────────────────────────────────────────────────
  ├── AIReports
  └── AnalyticsSnapshots
```

---

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| email | VARCHAR UNIQUE | Login email |
| username | VARCHAR | Username |
| first_name | VARCHAR | First name |
| last_name | VARCHAR | Last name |
| role | ENUM(admin,officer,citizen) | User role |
| phone | VARCHAR | Phone number |
| avatar | VARCHAR | Avatar image path |
| is_verified | BOOLEAN | Email verified |
| preferred_language | VARCHAR | UI language |
| created_at | TIMESTAMP | Registration time |

### citizen_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Auto ID |
| user_id | UUID FK | Reference to users |
| aadhaar_number | VARCHAR | ID number (encrypted) |
| address | TEXT | Home address |
| district | VARCHAR | District |
| state | VARCHAR | State |
| pincode | VARCHAR | PIN code |
| total_complaints | INT | Total submitted |
| resolved_complaints | INT | Total resolved |
| satisfaction_score | FLOAT | Average rating |

### officer_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Auto ID |
| user_id | UUID FK | Reference to users |
| employee_id | VARCHAR UNIQUE | Employee ID |
| department_id | UUID FK | Assigned department |
| designation | VARCHAR | Job title |
| district | VARCHAR | Working district |
| performance_score | FLOAT | AI-calculated score |
| total_assigned | INT | Total complaints assigned |
| total_resolved | INT | Total resolved |
| avg_resolution_time | FLOAT | Hours average |
| is_available | BOOLEAN | On duty status |

### departments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| name | VARCHAR | Department name |
| code | VARCHAR UNIQUE | Short code (WATER, ROADS) |
| description | TEXT | Description |
| icon | VARCHAR | Lucide icon name |
| color | VARCHAR | Hex color |
| sla_hours | INT | SLA deadline hours |
| total_complaints | INT | Cached total |
| resolved_complaints | INT | Cached resolved |
| performance_score | FLOAT | AI-calculated score |
| citizen_satisfaction | FLOAT | Average rating |

### complaints
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| ticket_number | VARCHAR UNIQUE | CP + 8 digits |
| citizen_id | BIGINT FK | Citizen profile |
| department_id | UUID FK | Assigned department |
| assigned_officer_id | UUID FK | Assigned officer |
| title | VARCHAR | Complaint title |
| description | TEXT | Full description |
| category | ENUM | water/roads/electricity/... |
| status | ENUM | submitted/under_review/... |
| priority | ENUM | low/medium/high/critical |
| sentiment | ENUM | angry/frustrated/urgent/... |
| district | VARCHAR | Location district |
| state | VARCHAR | Location state |
| latitude | FLOAT | GPS latitude |
| longitude | FLOAT | GPS longitude |
| ai_summary | TEXT | AI-generated summary |
| ai_category_confidence | FLOAT | Classification confidence |
| is_spam | BOOLEAN | Spam flag |
| spam_score | FLOAT | Spam probability |
| is_duplicate | BOOLEAN | Duplicate flag |
| delay_predicted | BOOLEAN | AI delay prediction |
| delay_probability | FLOAT | Delay probability |
| is_emergency | BOOLEAN | Emergency flag |
| sla_deadline | TIMESTAMP | SLA deadline |
| created_at | TIMESTAMP | Submission time |
| resolved_at | TIMESTAMP | Resolution time |

### complaint_history
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| complaint_id | UUID FK | Complaint reference |
| changed_by_id | UUID FK | User who changed |
| old_status | VARCHAR | Previous status |
| new_status | VARCHAR | New status |
| comment | TEXT | Officer comment |
| timestamp | TIMESTAMP | Change time |

### feedback
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| complaint_id | UUID FK UNIQUE | One per complaint |
| citizen_id | BIGINT FK | Citizen reference |
| rating | INT(1-5) | Star rating |
| comment | TEXT | Feedback text |
| is_satisfied | BOOLEAN | Satisfaction flag |
| created_at | TIMESTAMP | Feedback time |

### notifications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| user_id | UUID FK | Target user |
| type | ENUM | Notification type |
| title | VARCHAR | Notification title |
| message | TEXT | Full message |
| complaint_id | UUID FK | Related complaint |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Creation time |

### audit_logs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| user_id | UUID FK | Acting user |
| action | ENUM | login/create/update/delete |
| resource | VARCHAR | API endpoint |
| resource_id | VARCHAR | Resource ID |
| details | JSONB | Additional details |
| ip_address | INET | Client IP |
| user_agent | TEXT | Browser info |
| timestamp | TIMESTAMP | Action time |

### ai_reports
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| title | VARCHAR | Report title |
| report_type | ENUM | daily/weekly/monthly |
| data | JSONB | Report data |
| generated_by_id | UUID FK | Admin user |
| generated_at | TIMESTAMP | Generation time |
| pdf_file | VARCHAR | PDF file path |

### analytics_snapshots
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| date | DATE UNIQUE | Snapshot date |
| total_complaints | INT | Daily total |
| new_complaints | INT | New that day |
| resolved_complaints | INT | Resolved that day |
| governance_score | FLOAT | Daily score |
| category_breakdown | JSONB | Category counts |
| district_breakdown | JSONB | District counts |
