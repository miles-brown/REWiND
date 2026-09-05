# REWiND Location Data Standard

## 1. Principles of Historical Geography

Historical events occur at specific physical coordinates. REWiND rejects collapsing locations to mere city/country pairs. An event demands structured spatial resolution:

```text
venue
building
room / hall / stage / studio
airport terminal / runway
vehicle (aircraft, train, vessel, motorcade)
street / thoroughfare / public square
descriptive spatial location
official postal address (nationally formatted)
locality / neighbourhood
city / municipality
administrative region / state / county
country / sovereign state
principal latitude & longitude
coordinate precision
coordinate source
geospatial confidence
```

---

## 2. 14-Tier Location Precision Spectrum

REWiND categorizes geographic precision across 14 discrete tiers:

| Tier | Precision | Definition | Example |
| :--- | :--- | :--- | :--- |
| **1** | `room` | Specific indoor room, office, or dais | Oval Office, White House |
| **2** | `building` | Discrete named structure | Blair House, Washington, D.C. |
| **3** | `complex` | Multi-building institutional facility | United Nations Headquarters, NY |
| **4** | `street-address` | Exact official postal building number and street | 10 Downing Street, London |
| **5** | `street` | Thoroughfare or avenue without specific building | Pennsylvania Avenue NW |
| **6** | `neighbourhood` | Distinct civic quarter or urban district | Westminster, London |
| **7** | `city` | Municipality, town, or city boundary | Geneva, Switzerland |
| **8** | `metropolitan-area` | Greater regional urban zone | Greater Tokyo Area |
| **9** | `administrative-subdivision` | District, canton, or borough | Manhattan, New York County |
| **10** | `administrative-region` | State, province, or governorate | State of New York |
| **11** | `country` | Sovereign national jurisdiction | State of Israel |
| **12** | `airspace` | En route aerial corridor | International Airspace over Mediterranean |
| **13** | `maritime` | Territorial waters or high seas | Red Sea International Waters |
| **14** | `unknown` | Undetermined spatial coordinates | Location unverified in sources |

---

## 3. Principal Event Coordinate & Participant Coordinates

1. **Principal Event Coordinate**: The centroid representing the closest defensible location for the event's primary action.
2. **Participant Micro-Location**: In complex multi-person events (summits, state dinners, funerals), individual participants can record specific sub-locations (`stage`, `plenary-podium`, `delegation-bench`, `press-gallery`).

---

## 4. Address Formatting & Descriptive Locality

- **Native Postal Addresses**: Addresses must respect the origin country's official postal standard rather than forcing non-Western locations into UK or US addressing models.
- **Descriptive Locality**: Human-readable narrative landmarks (e.g., *"East bank of Potomac River, 200m north of Key Bridge"*) are maintained whenever standard postal addresses are unavailable or uninformative.
