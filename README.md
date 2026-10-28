# Nexcrest Insights - Operations & KPI Command Center

A high-performance, dark-themed operations management dashboard built specifically for **Nexcrest Insights**. It enables the **Marketing Manager** to allocate monthly deliverable quotas, track real-time pacing, and review submitted proof links for:
1. **Graphic Designer** (25 Monthly Deliverables)
2. **Videographer + Editor** (18 Video Assets & Edits)
3. **Marketing Executive** (Campaigns, Leads & Social Reach)

---

## 🎨 Deliverables Breakdown by Role & Brand

### 1. Graphic Designer Deliverables (25 Monthly Quota)
As defined in the official Deliverables by Brand chart across the 3 core categories:

| Brand | Category | Content / Program | Format | Target Qty |
| :--- | :--- | :--- | :--- | :---: |
| **Insights** | Campus Events | NexTalk Series | Carousel | **1** |
| **Insights** | Campus Events | Let's Talk Series | Carousel | **1** |
| **Insights** | Campus Events | LinkedIn Contest | Carousel | **1** |
| **Insights** | Campus Events | Experts Talk | Poster | **1** |
| **Insights** | Campus Events | Experts Talk | Carousel | **1** |
| **Insights** | Branding | Informative Contents | Carousel | **5** |
| **IT** | Branding | Informative Contents | Carousel | **5** |
| **Insights** | Marketing | Marketing Posters | Poster | **5** |
| **IT** | Marketing | Marketing Posters | Poster | **5** |
| **Total** | | **Monthly design deliverables** | | **25** |

---

### 2. Videographer + Editor Deliverables (18 Video Assets)
Structured across the same 3 categories (**Campus Events**, **Branding**, **Marketing**):

| Brand | Category | Content / Program | Format | Target Qty |
| :--- | :--- | :--- | :--- | :---: |
| **Insights** | Campus Events | NexTalk & Let's Talk Coverage | 9:16 Reel / Highlight | **2** |
| **Insights** | Campus Events | Experts Talk Speaker Clips & Student Reactions | Vertical Reels | **3** |
| **Insights** | Branding | Techschool Life & Campus Culture Series | Cinematic 9:16 Reel | **4** |
| **IT** | Branding | IT Program Explainers & Faculty Insights | Short Video Clips | **4** |
| **Insights** | Marketing | Course Admission Video Ads | Paid Ad Creative (9:16 & 1:1) | **3** |
| **IT** | Marketing | Student Career Transformation Testimonials | Long-form Video (16:9) | **2** |
| **Total** | | **Monthly video production** | | **18** |

---

### 3. Marketing Executive Deliverables & KPIs
Structured across the same 3 categories (**Campus Events**, **Branding**, **Marketing**):

| Brand | Category | Content / Program | Format | Target Qty |
| :--- | :--- | :--- | :--- | :---: |
| **Insights** | Campus Events | NexTalk & Let's Talk Audience Registrations | Event Registration Drive | **2 Drives (150 RSVPs)** |
| **Insights** | Campus Events | LinkedIn Contest & Student Engagement Campaign | Organic Engagement Sprints | **3 Sprints** |
| **Insights** | Branding | Multi-Platform Content Distribution & Growth | Daily Social Publishing | **12 Scheduled Posts** |
| **IT** | Branding | IT Career Community & Newsletter Broadcasts | Bi-Weekly Tech Newsletter | **2 Issues** |
| **Insights** | Marketing | Meta & Google Lead Acquisition Ads | Paid Lead Funnel | **4 Sets (300 Leads)** |
| **IT** | Marketing | IT Upskilling Conversion Campaign | Conversion Funnel | **2 Sets (120 Inquiries)** |

---

## 🔐 Demo Accounts & Authentication

The tool includes role-protected dashboards with instant single-click demo switching:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Marketing Manager** | `manager@nexcrest.com` | `Nexloic0131` | Full Admin: Target Assignment, Review Queue, Approvals, Analytics, Cloud Sync |
| **Graphic Designer** | `designer@nexcrest.com` | `password123` | Designer Dashboard: 25 Deliverable targets, link submissions, review feedback |
| **Videographer + Editor** | `videographer@nexcrest.com` | `password123` | Video Dashboard: Video quotas, rough-cut link submissions, remarks |
| **Marketing Executive** | `marketing@nexcrest.com` | `password123` | Growth Portal: Ad campaign links, lead reports, event coordination logs |

> **Pro Tip:** In the top header bar, you can instantly toggle between **Manager**, **Graphic Designer**, **Videographer**, and **Marketing Exec** with the quick switcher buttons.

---

## 🚀 Key Operational Features

1. **Employee Onboarding & Team Roster (Manager View)**:
   - Click **"+ Add Employee"** from the top header or navigate to the **"Team Roster & Staff"** tab.
   - Enter Full Name, Work Email, Department Track (Graphic Designer, Videographer, Marketing Exec, Content Writer, Motion Designer, Community Lead), Designation/Job Title, and Brand Assignment.
   - Onboarded employees are instantly saved to persistent local storage and can sign into their own personal workspace.
   - Manage team members directly: view their individual monthly completion pacing, click **"Assign Task"** to allocate new deliverables, or **"View Portal"** to test their member experience.

2. **Target Assignment Studio (Manager View)**:
   - Click **"+ Assign Target"** to allocate deliverable quotas to standard roles or directly to specific onboarded employees.
   - Customize Brand (`Insights`, `IT`), Category, Format, Program Title, Target Quantity, and Guidelines.
   - Edit or delete assigned targets anytime.

3. **Quality Review Queue (Manager View)**:
   - When a team member marks work, it lands in the **Review Queue**.
   - Manager sees direct preview links (Figma, Google Drive, Frame.io, Social posts) along with author details.
   - One-click **"Approve & Count as Done"** (increments the completed KPI counter) or **"Request Revision"** with detailed feedback.

4. **Pacing Engine**:
   - Calculates month-to-date pacing (e.g., *Day 16 of 31: Expected 51.6% pace vs. Actual %*).
   - Instant visual cues: **Ahead / On Track** (Green) or **Behind Target** (Red).

5. **Category & Brand Filtering**:
   - Filter down deliverables by **Brand** (`Insights`, `IT`), **Category** (`Campus Events`, `Branding`, `Marketing`), and **Role / Assignee**.

6. **Data Export & Local Persistence**:
   - All state (targets, submissions, and employees) is automatically persisted in browser `localStorage`.
   - Click **"Export Report"** to download complete monthly performance data as JSON.

---

## 💻 Running Locally

Simply open `index.html` in any web browser, or run a local dev server from this directory:

```bash
# Using Python
python -m http.server 4173

# Or using npx serve
npx serve .
```
Navigate to `http://localhost:4173` to access the application.

---

## 🚀 Repository & GitHub Pages Deployment

- **Repository**: [https://github.com/SANOOFKV/nexcrest-insights](https://github.com/SANOOFKV/nexcrest-insights)
- **Live Deployment**: [https://sanoofkv.github.io/nexcrest-insights/](https://sanoofkv.github.io/nexcrest-insights/)

To push local changes:

```powershell
cd "d:\Antigravity\Nexcrest Insights"
git add .
git commit -m "docs: Update project to Nexcrest Insights"
git push origin main
```

