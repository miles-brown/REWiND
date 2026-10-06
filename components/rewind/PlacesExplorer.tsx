"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building,
  Building2,
  ChevronDown,
  ChevronRight,
  Compass,
  CornerDownRight,
  Globe2,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { GeographicHierarchyTree } from "@/lib/rewind";

export type HierarchyTab = "tree" | "countries" | "cities" | "venues" | "addresses";
export type SortOption = "events-desc" | "name-asc" | "venues-desc";

export interface PlacesExplorerProps {
  hierarchy: GeographicHierarchyTree;
  error?: string | null;
}

/**
 * Maps a venue type to its display label and CSS badge class, with a forensic fallback.
 */
function getVenueTypeBadge(type?: string | null): { label: string; className: string } {
  if (!type || !type.trim()) {
    return { label: "VENUE", className: "badge-default" };
  }
  const norm = type.trim().toLowerCase().replace(/[_\s]+/g, "-");
  switch (norm) {
    case "executive-residence":
    case "presidential-residence":
    case "royal-palace":
    case "official-residence":
      return { label: "Executive Residence", className: "badge-executive" };
    case "parliament":
    case "legislative-complex":
    case "congress":
      return { label: "Legislative Complex", className: "badge-parliament" };
    case "international-body":
    case "diplomatic-hq":
    case "embassy":
    case "consulate":
      return { label: "Diplomatic HQ", className: "badge-diplomatic" };
    case "summit-center":
    case "conference-center":
    case "convention-center":
      return { label: "Summit Center", className: "badge-summit" };
    case "transport":
    case "airport":
    case "heliport":
    case "railway-station":
    case "port":
      return { label: "Airport / Transit", className: "badge-transport" };
    case "memorial":
    case "historical-landmark":
    case "monument":
      return { label: "Historical Landmark", className: "badge-memorial" };
    case "religious-center":
    case "cathedral":
    case "mosque":
    case "synagogue":
    case "temple":
      return { label: "Religious Center", className: "badge-religious" };
    case "hotel":
    case "resort":
      return { label: "Hotel / Lodging", className: "badge-default" };
    case "military-base":
    case "barracks":
      return { label: "Military Facility", className: "badge-default" };
    case "unknown":
    case "unknown-venue-type":
      return { label: "UNKNOWN VENUE TYPE", className: "badge-default" };
    default:
      return {
        label: norm.length > 0 ? norm.replace(/-/g, " ").toUpperCase() : "UNKNOWN VENUE TYPE",
        className: "badge-default",
      };
  }
}

/**
 * Renders searchable, filterable geographic tree and list views with sorting,
 * expandable country/city nodes, and an optional data-loading error notice.
 */
export function PlacesExplorer({ hierarchy, error }: PlacesExplorerProps) {
  const [activeTab, setActiveTab] = useState<HierarchyTab>("tree");
  const [query, setQuery] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedVenueType, setSelectedVenueType] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("events-desc");

  const searchInputId = useId();
  const countryFilterId = useId();
  const cityFilterId = useId();
  const venueTypeFilterId = useId();
  const sortFilterId = useId();

  // Expanded tree nodes state
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(() => {
    // Default expand top 3 countries with most events
    const top = hierarchy.countries.slice(0, 3).map((c) => c.slug);
    return new Set(top);
  });

  const [expandedCities, setExpandedCities] = useState<Set<string>>(() => {
    // Default expand top cities
    const set = new Set<string>();
    hierarchy.countries.slice(0, 3).forEach((c) => {
      c.cities.slice(0, 2).forEach((city) => set.add(city.slug));
    });
    return set;
  });

  const toggleCountry = (slug: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const toggleCity = (slug: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allC = new Set(hierarchy.allCountries.map((c) => c.slug));
    const allCity = new Set(hierarchy.allCities.map((c) => c.slug));
    setExpandedCountries(allC);
    setExpandedCities(allCity);
  };

  const collapseAll = () => {
    setExpandedCountries(new Set());
    setExpandedCities(new Set());
  };

  const handleResetFilters = () => {
    setQuery("");
    setSelectedCountry("all");
    setSelectedCity("all");
    setSelectedVenueType("all");
    setSortOption("events-desc");
  };

  // Distinct venue types across all venues
  const distinctVenueTypes = useMemo(() => {
    const set = new Set<string>();
    hierarchy.allVenues.forEach((v) => {
      if (v.venueType) set.add(v.venueType);
    });
    return Array.from(set).sort();
  }, [hierarchy.allVenues]);

  // Available cities filtered by selectedCountry
  const availableCities = useMemo(() => {
    if (selectedCountry === "all") return hierarchy.allCities;
    return hierarchy.allCities.filter(
      (c) => c.country.toLowerCase().replace(/\s+/g, "-") === selectedCountry
    );
  }, [hierarchy.allCities, selectedCountry]);

  // Filtering logic
  const q = query.trim().toLowerCase();

  const filteredCountries = useMemo(() => {
    let result = hierarchy.allCountries;
    if (selectedCountry !== "all") {
      result = result.filter((c) => c.slug === selectedCountry);
    }
    if (q) {
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "venues-desc") return b.venueCount - a.venueCount;
      return b.eventCount - a.eventCount;
    });
  }, [hierarchy.allCountries, selectedCountry, q, sortOption]);

  const filteredCities = useMemo(() => {
    let result = hierarchy.allCities;
    if (selectedCountry !== "all") {
      result = result.filter(
        (c) => c.country.toLowerCase().replace(/\s+/g, "-") === selectedCountry
      );
    }
    if (selectedCity !== "all") {
      result = result.filter((c) => c.slug === selectedCity);
    }
    if (q) {
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "venues-desc") return b.venueCount - a.venueCount;
      return b.eventCount - a.eventCount;
    });
  }, [hierarchy.allCities, selectedCountry, selectedCity, q, sortOption]);

  const filteredVenues = useMemo(() => {
    let result = hierarchy.allVenues;
    if (selectedCountry !== "all") {
      result = result.filter(
        (v) => v.country.toLowerCase().replace(/\s+/g, "-") === selectedCountry
      );
    }
    if (selectedCity !== "all") {
      result = result.filter((v) => {
        const cSlug = `${v.country.toLowerCase().replace(/\s+/g, "-")}-${v.city.toLowerCase().replace(/\s+/g, "-")}`;
        return cSlug === selectedCity;
      });
    }
    if (selectedVenueType !== "all") {
      result = result.filter((v) => v.venueType === selectedVenueType);
    }
    if (q) {
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.country.toLowerCase().includes(q) ||
          (v.streetAddress && v.streetAddress.toLowerCase().includes(q)) ||
          (v.venueAreas && v.venueAreas.some((a) => a.name.toLowerCase().includes(q)))
      );
    }
    return [...result].sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      return b.eventCount - a.eventCount;
    });
  }, [hierarchy.allVenues, selectedCountry, selectedCity, selectedVenueType, q, sortOption]);

  const filteredAddresses = useMemo(() => {
    let result = hierarchy.allAddresses;
    if (selectedCountry !== "all") {
      result = result.filter(
        (a) => a.country.toLowerCase().replace(/\s+/g, "-") === selectedCountry
      );
    }
    if (selectedCity !== "all") {
      result = result.filter((a) => {
        const cSlug = `${a.country.toLowerCase().replace(/\s+/g, "-")}-${a.city.toLowerCase().replace(/\s+/g, "-")}`;
        return cSlug === selectedCity;
      });
    }
    if (q) {
      result = result.filter(
        (a) =>
          a.formattedAddress.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.venuesLocatedHere.some((v) => v.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (sortOption === "name-asc") return a.formattedAddress.localeCompare(b.formattedAddress);
      return b.eventCount - a.eventCount;
    });
  }, [hierarchy.allAddresses, selectedCountry, selectedCity, q, sortOption]);

  // Filtered Tree Structure
  const filteredTree = useMemo(() => {
    return hierarchy.countries
      .filter((c) => {
        if (selectedCountry !== "all" && c.slug !== selectedCountry) return false;
        if (!q) return true;
        const matchesCountry = c.name.toLowerCase().includes(q);
        const matchesAnyCity = c.cities.some(
          (city) =>
            city.name.toLowerCase().includes(q) ||
            city.venues.some(
              (v) =>
                v.name.toLowerCase().includes(q) ||
                (v.streetAddress && v.streetAddress.toLowerCase().includes(q)) ||
                (v.venueAreas && v.venueAreas.some((a) => a.name.toLowerCase().includes(q)))
            ) ||
            city.addresses.some(
              (a) =>
                a.formattedAddress.toLowerCase().includes(q) ||
                a.venuesLocatedHere.some((v) => v.toLowerCase().includes(q))
            )
        );
        return matchesCountry || matchesAnyCity;
      })
      .map((c) => {
        const cities = c.cities
          .filter((city) => {
            if (selectedCity !== "all" && city.slug !== selectedCity) return false;
            if (!q) return true;
            const matchesCity = city.name.toLowerCase().includes(q);
            const matchesVenue = city.venues.some(
              (v) =>
                v.name.toLowerCase().includes(q) ||
                (v.streetAddress && v.streetAddress.toLowerCase().includes(q)) ||
                (v.venueAreas && v.venueAreas.some((a) => a.name.toLowerCase().includes(q)))
            );
            const matchesAddress = city.addresses.some(
              (a) =>
                a.formattedAddress.toLowerCase().includes(q) ||
                a.venuesLocatedHere.some((v) => v.toLowerCase().includes(q))
            );
            return matchesCity || matchesVenue || matchesAddress;
          })
          .map((city) => {
            const venues = city.venues.filter((v) => {
              if (selectedVenueType !== "all" && v.venueType !== selectedVenueType) return false;
              if (!q) return true;
              return (
                v.name.toLowerCase().includes(q) ||
                (v.streetAddress && v.streetAddress.toLowerCase().includes(q)) ||
                (v.venueAreas && v.venueAreas.some((a) => a.name.toLowerCase().includes(q)))
              );
            });
            const addresses = city.addresses.filter((a) => {
              if (!q) return true;
              return (
                a.formattedAddress.toLowerCase().includes(q) ||
                a.venuesLocatedHere.some((v) => v.toLowerCase().includes(q))
              );
            });
            return {
              ...city,
              venues,
              addresses,
            };
          });
        return {
          ...c,
          cities,
        };
      })
      .filter((c) => c.cities.length > 0 || (q && c.name.toLowerCase().includes(q)));
  }, [hierarchy.countries, selectedCountry, selectedCity, selectedVenueType, q]);

  const summary = hierarchy.summary;

  // Dynamic screen reader status message for filter & search updates
  const liveAnnouncementText = useMemo(() => {
    const filterParts = [
      selectedCountry !== "all" ? `in ${selectedCountry}` : null,
      selectedCity !== "all" ? `city ${selectedCity}` : null,
      selectedVenueType !== "all" ? `type ${selectedVenueType}` : null,
      q ? `matching "${query}"` : null,
    ].filter(Boolean);

    const filterSuffix = filterParts.length > 0 ? ` (${filterParts.join(", ")})` : "";

    switch (activeTab) {
      case "tree":
        return `Hierarchy tree view: showing ${filteredTree.length} countries${filterSuffix}.`;
      case "countries":
        return `Countries view: showing ${filteredCountries.length} countries${filterSuffix}.`;
      case "cities":
        return `Cities view: showing ${filteredCities.length} cities${filterSuffix}.`;
      case "venues":
        return `Venues view: showing ${filteredVenues.length} venues${filterSuffix}.`;
      case "addresses":
        return `Street addresses view: showing ${filteredAddresses.length} addresses${filterSuffix}.`;
      default:
        return `Geographic gazetteer updated${filterSuffix}.`;
    }
  }, [
    activeTab,
    filteredTree.length,
    filteredCountries.length,
    filteredCities.length,
    filteredVenues.length,
    filteredAddresses.length,
    selectedCountry,
    selectedCity,
    selectedVenueType,
    q,
    query,
  ]);

  return (
    <div className="places-explorer-wrapper">
      {/* Screen Reader Live Announcement Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncementText}
      </div>

      {/* Forensic Metric Strip */}
      <div className="hierarchy-stats-bar" role="region" aria-label="Geographic Hierarchy Summary">
        <div className="stat-pill tier-country">
          <Globe2 size={16} aria-hidden="true" />
          <div>
            <b>{summary.totalCountries}</b>
            <span>Countries (Tier 1)</span>
          </div>
        </div>
        <div className="stat-pill tier-city">
          <Building2 size={16} aria-hidden="true" />
          <div>
            <b>{summary.totalCities}</b>
            <span>Cities (Tier 2)</span>
          </div>
        </div>
        <div className="stat-pill tier-venue">
          <Building size={16} aria-hidden="true" />
          <div>
            <b>{summary.totalVenues}</b>
            <span>Venues & Complexes (Tier 3)</span>
          </div>
        </div>
        <div className="stat-pill tier-address">
          <MapPin size={16} aria-hidden="true" />
          <div>
            <b>{summary.totalAddresses}</b>
            <span>Street Addresses (Tier 4)</span>
          </div>
        </div>
        <div className="stat-pill tier-events">
          <ShieldCheck size={16} aria-hidden="true" />
          <div>
            <b>{summary.totalEvents}</b>
            <span>Documented Events</span>
          </div>
        </div>
      </div>

      {/* Forensic Toolbar & Search Filters */}
      <div className="places-toolbar">
        {/* Tier Tabs */}
        <div className="tier-tab-group" role="tablist" aria-label="Geographic Levels">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tree"}
            className={`tier-tab ${activeTab === "tree" ? "active" : ""}`}
            onClick={() => setActiveTab("tree")}
          >
            <Layers size={15} aria-hidden="true" />
            <span>Tree Hierarchy</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "countries"}
            className={`tier-tab ${activeTab === "countries" ? "active" : ""}`}
            onClick={() => setActiveTab("countries")}
          >
            <Globe2 size={15} aria-hidden="true" />
            <span>Countries ({summary.totalCountries})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cities"}
            className={`tier-tab ${activeTab === "cities" ? "active" : ""}`}
            onClick={() => setActiveTab("cities")}
          >
            <Building2 size={15} aria-hidden="true" />
            <span>Cities ({summary.totalCities})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "venues"}
            className={`tier-tab ${activeTab === "venues" ? "active" : ""}`}
            onClick={() => setActiveTab("venues")}
          >
            <Building size={15} aria-hidden="true" />
            <span>Venues ({summary.totalVenues})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "addresses"}
            className={`tier-tab ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin size={15} aria-hidden="true" />
            <span>Street Addresses ({summary.totalAddresses})</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="places-filter-row">
          <div className="search-input-box">
            <Search size={16} aria-hidden="true" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search by venue name, address, city, or country..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search geographic gazetteer"
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-dropdown-group">
            {/* Country Filter */}
            <div className="filter-select-wrapper">
              <label htmlFor={countryFilterId} className="sr-only">Filter by Country</label>
              <select
                id={countryFilterId}
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity("all");
                }}
                aria-label="Filter by Country"
              >
                <option value="all">All Countries ({hierarchy.allCountries.length})</option>
                {hierarchy.allCountries.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.eventCount} events)
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="filter-select-wrapper">
              <label htmlFor={cityFilterId} className="sr-only">Filter by City</label>
              <select
                id={cityFilterId}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter by City"
              >
                <option value="all">All Cities ({availableCities.length})</option>
                {availableCities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}, {c.country} ({c.eventCount} events)
                  </option>
                ))}
              </select>
            </div>

            {/* Venue Type Filter (for venues and tree) */}
            {(activeTab === "venues" || activeTab === "tree") && (
              <div className="filter-select-wrapper">
                <label htmlFor={venueTypeFilterId} className="sr-only">Filter by Venue Type</label>
                <select
                  id={venueTypeFilterId}
                  value={selectedVenueType}
                  onChange={(e) => setSelectedVenueType(e.target.value)}
                  aria-label="Filter by Venue Type"
                >
                  <option value="all">All Venue Types</option>
                  {distinctVenueTypes.map((t) => (
                    <option key={t} value={t}>
                      {getVenueTypeBadge(t).label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Selector */}
            <div className="filter-select-wrapper">
              <label htmlFor={sortFilterId} className="sr-only">Sort Places</label>
              <select
                id={sortFilterId}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Sort Places"
              >
                <option value="events-desc">Most Documented Events</option>
                <option value="name-asc">Alphabetical (A–Z)</option>
                <option value="venues-desc">Most Venues</option>
              </select>
            </div>

            {/* Tree View Controls */}
            {activeTab === "tree" && (
              <div className="tree-action-btns">
                <button
                  type="button"
                  className="tree-btn"
                  onClick={expandAll}
                  title="Expand All Nodes"
                  aria-label="Expand All Tree Nodes"
                >
                  <Maximize2 size={14} aria-hidden="true" />
                  <span>Expand All</span>
                </button>
                <button
                  type="button"
                  className="tree-btn"
                  onClick={collapseAll}
                  title="Collapse All Nodes"
                  aria-label="Collapse All Tree Nodes"
                >
                  <Minimize2 size={14} aria-hidden="true" />
                  <span>Collapse All</span>
                </button>
              </div>
            )}

            {/* Reset Button */}
            {(query || selectedCountry !== "all" || selectedCity !== "all" || selectedVenueType !== "all") && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error state if database error */}
      {error && (
        <div className="hierarchy-error-banner" role="alert">
          <p>⚠️ Notice: Live geographic registry sync error ({error}). Displaying authoritative gazetteer fallback.</p>
        </div>
      )}

      {/* VIEW 1: HIERARCHY TREE */}
      {activeTab === "tree" && (
        <div className="hierarchy-tree-view" role="tabpanel" aria-label="Hierarchical Tree View">
          {filteredTree.length === 0 ? (
            <div className="hierarchy-empty-state">
              <Compass size={40} aria-hidden="true" />
              <h3>No matching geographic entities</h3>
              <p>No countries, cities, venues, or addresses matched your filter criteria.</p>
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="tree-container">
              {filteredTree.map((country) => {
                const isCountryExpanded = expandedCountries.has(country.slug);
                return (
                  <div key={country.slug} className={`tree-country-card ${isCountryExpanded ? "expanded" : ""}`}>
                    {/* Country Node Header */}
                    <div className="tree-node-header country-node">
                      <button
                        type="button"
                        className="node-toggle-btn"
                        onClick={() => toggleCountry(country.slug)}
                        aria-expanded={isCountryExpanded}
                        aria-label={`${isCountryExpanded ? "Collapse" : "Expand"} ${country.name} hierarchy`}
                      >
                        <div className="node-toggle-icon" aria-hidden="true">
                          {isCountryExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                        <div className="country-flag-badge" aria-hidden="true">
                          <Globe2 size={16} />
                        </div>
                        <div className="node-meta">
                          <div className="node-title-row">
                            <span className="tier-tag country-tag">COUNTRY · TIER 1</span>
                            <h2 className="node-title">{country.name}</h2>
                            <span className="country-code-chip">{country.code}</span>
                          </div>
                          <div className="node-stats-row">
                            <span>🏛️ {country.cities.length} {country.cities.length === 1 ? "City" : "Cities"}</span>
                            <span>·</span>
                            <span>🏢 {country.venueCount} {country.venueCount === 1 ? "Venue" : "Venues"}</span>
                            <span>·</span>
                            <span>📍 {country.addressCount} {country.addressCount === 1 ? "Address" : "Addresses"}</span>
                          </div>
                        </div>
                      </button>
                      <div className="node-actions-right">
                        <span className="event-count-badge">{country.eventCount} {country.eventCount === 1 ? "Event" : "Events"}</span>
                        <Link href={`/place/${country.slug}`} className="view-place-link" title={`View ${country.name} Dossier`}>
                          <span>View</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Nested Cities under Country */}
                    {isCountryExpanded && (
                      <div className="tree-cities-list">
                        {country.cities.length === 0 ? (
                          <div className="tree-empty-nested-hint" style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>
                            No cities or municipalities match the active filter criteria for this jurisdiction.
                          </div>
                        ) : (
                          country.cities.map((city) => {
                            const isCityExpanded = expandedCities.has(city.slug);
                            return (
                              <div key={city.slug} className={`tree-city-card ${isCityExpanded ? "expanded" : ""}`}>
                                {/* City Node Header */}
                                <div className="tree-node-header city-node">
                                  <button
                                    type="button"
                                    className="node-toggle-btn"
                                    onClick={() => toggleCity(city.slug)}
                                    aria-expanded={isCityExpanded}
                                    aria-label={`${isCityExpanded ? "Collapse" : "Expand"} ${city.name} hierarchy`}
                                  >
                                    <div className="node-toggle-icon" aria-hidden="true">
                                      {isCityExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                    <div className="city-icon-badge" aria-hidden="true">
                                      <Building2 size={15} />
                                    </div>
                                    <div className="node-meta">
                                      <div className="node-title-row">
                                        <span className="tier-tag city-tag">CITY · TIER 2</span>
                                        <h3 className="city-title">{city.name}</h3>
                                      </div>
                                      <div className="node-stats-row">
                                        <span>{city.venues.length} {city.venues.length === 1 ? "Venue" : "Venues"}</span>
                                        <span>·</span>
                                        <span>{city.addresses.length} {city.addresses.length === 1 ? "Address" : "Addresses"}</span>
                                        {city.latitude && city.longitude && (
                                          <>
                                            <span>·</span>
                                            <span className="coord-text">{city.latitude.toFixed(4)}°, {city.longitude.toFixed(4)}°</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                  <div className="node-actions-right">
                                    <span className="event-count-badge city-badge">{city.eventCount} Events</span>
                                    <Link href={`/place/${city.slug}`} className="view-place-link" title={`View ${city.name} Chronicles`}>
                                      <span>View</span>
                                      <ArrowRight size={14} />
                                    </Link>
                                  </div>
                                </div>

                                {/* Nested Venues & Addresses under City */}
                                {isCityExpanded && (
                                  <div className="tree-leaves-container">
                                    {city.venues.length === 0 && city.addresses.length === 0 ? (
                                      <div className="tree-empty-nested-hint" style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>
                                        No venues or street addresses match the active filter criteria in {city.name}.
                                      </div>
                                    ) : (
                                      <>
                                        {/* Venues Section */}
                                        {city.venues.length > 0 && (
                                          <div className="tree-sub-section venues-sub-section">
                                            <div className="sub-section-header">
                                              <Building size={14} />
                                              <h4>Venues & Complexes ({city.venues.length})</h4>
                                              <small className="sub-section-hint">Institutional locations situated in {city.name}</small>
                                            </div>
                                            <div className="venue-leaf-grid">
                                              {city.venues.map((venue) => {
                                                const badge = getVenueTypeBadge(venue.venueType);
                                                return (
                                                  <div key={venue.id} className="venue-leaf-card">
                                                    <div className="venue-leaf-header">
                                                      <div className="venue-leaf-title-wrap">
                                                        <span className={`venue-type-chip ${badge.className}`}>
                                                          {badge.label}
                                                        </span>
                                                        <Link href={`/place/${venue.slug}`} className="venue-leaf-title">
                                                          <h5>{venue.name}</h5>
                                                        </Link>
                                                      </div>
                                                      <span className="event-pill">{venue.eventCount} {venue.eventCount === 1 ? "record" : "records"}</span>
                                                    </div>

                                                    {/* Street Address Association (CRITICAL) */}
                                                    {venue.streetAddress && (
                                                      <div className="venue-address-row">
                                                        <MapPin size={13} className="address-pin-icon" />
                                                        <span className="venue-address-label">Address:</span>
                                                        <span className="venue-address-val">{venue.streetAddress}</span>
                                                      </div>
                                                    )}

                                                    {/* Sub-Venue Areas (e.g. Oval Office, Cabinet Room) */}
                                                    {venue.venueAreas && venue.venueAreas.length > 0 && (
                                                      <div className="venue-areas-strip">
                                                        <span className="areas-label">Areas:</span>
                                                        <div className="area-tags">
                                                          {venue.venueAreas.map((area) => (
                                                            <span key={area.id} className="area-tag">
                                                              {area.name}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}

                                                    <div className="venue-leaf-footer">
                                                      <Link href={`/place/${venue.slug}`} className="venue-explore-btn">
                                                        <span>Examine Venue Records</span>
                                                        <CornerDownRight size={13} />
                                                      </Link>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* Street Addresses Section */}
                                        {city.addresses.length > 0 && (
                                          <div className="tree-sub-section addresses-sub-section">
                                            <div className="sub-section-header">
                                              <MapPin size={14} />
                                              <h4>Street Addresses ({city.addresses.length})</h4>
                                              <small className="sub-section-hint">Physical postal and road locations</small>
                                            </div>
                                            <div className="address-leaf-grid">
                                              {city.addresses.map((address) => (
                                                <div key={address.id} className="address-leaf-card">
                                                  <div className="address-leaf-header">
                                                    <div className="address-title-wrap">
                                                      <span className="tier-tag address-tag">ADDRESS · TIER 4</span>
                                                      <h5 className="address-text">{address.formattedAddress}</h5>
                                                    </div>
                                                    <span className="event-pill">{address.eventCount} {address.eventCount === 1 ? "record" : "records"}</span>
                                                  </div>

                                                  {address.district && (
                                                    <div className="address-district-row">
                                                      <small>District: {address.district}</small>
                                                    </div>
                                                  )}

                                                  {/* Venues Located Here */}
                                                  {address.venuesLocatedHere.length > 0 && (
                                                    <div className="venues-at-address-box">
                                                      <span className="at-addr-label">Venues situated here:</span>
                                                      <ul className="at-addr-list">
                                                        {address.venuesLocatedHere.map((vName, idx) => (
                                                          <li key={idx}>🏛️ {vName}</li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}

                                                  <div className="address-leaf-footer">
                                                    <Link href={`/place/${address.slug}`} className="venue-explore-btn">
                                                      <span>Address Events</span>
                                                      <CornerDownRight size={13} />
                                                    </Link>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COUNTRIES (TIER 1) */}
      {activeTab === "countries" && (
        <div className="hierarchy-tab-panel" role="tabpanel" aria-label="Countries Tier 1">
          <div className="tier-intro-banner">
            <Globe2 size={24} />
            <div>
              <h3>Tier 1: Sovereign Nation-States & International Jurisdictions</h3>
              <p>Top-level sovereign jurisdictions aggregating documented metropolitan centers, diplomatic complexes, and verified geopolitical events.</p>
            </div>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="hierarchy-empty-state">
              <p>No countries match your search filters.</p>
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="entity-card-grid countries-grid">
              {filteredCountries.map((country) => (
                <div key={country.slug} className="entity-card country-card">
                  <div className="card-top-row">
                    <span className="country-flag-icon">🌐</span>
                    <span className="entity-code">{country.code}</span>
                    <span className="event-count-badge ml-auto">{country.eventCount} Events</span>
                  </div>

                  <h3 className="entity-title">{country.name}</h3>

                  <div className="entity-breakdown-row">
                    <div className="breakdown-col">
                      <b>{country.cityCount}</b>
                      <span>{country.cityCount === 1 ? "City" : "Cities"}</span>
                    </div>
                    <div className="breakdown-col">
                      <b>{country.venueCount}</b>
                      <span>{country.venueCount === 1 ? "Venue" : "Venues"}</span>
                    </div>
                    <div className="breakdown-col">
                      <b>{country.addressCount}</b>
                      <span>{country.addressCount === 1 ? "Address" : "Addresses"}</span>
                    </div>
                  </div>

                  <div className="card-footer-row">
                    <Link href={`/place/${country.slug}`} className="entity-action-btn">
                      <span>Explore National Records</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CITIES (TIER 2) */}
      {activeTab === "cities" && (
        <div className="hierarchy-tab-panel" role="tabpanel" aria-label="Cities Tier 2">
          <div className="tier-intro-banner">
            <Building2 size={24} />
            <div>
              <h3>Tier 2: Metropolitan Centers & Municipalities</h3>
              <p>Major cities, capital districts, and metropolitan hubs containing institutional venues and physical street addresses.</p>
            </div>
          </div>

          {filteredCities.length === 0 ? (
            <div className="hierarchy-empty-state">
              <p>No cities match your search filters.</p>
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="entity-card-grid cities-grid">
              {filteredCities.map((city) => (
                <div key={city.slug} className="entity-card city-card">
                  <div className="card-top-row">
                    <span className="tier-tag city-tag">CITY · TIER 2</span>
                    <span className="event-count-badge ml-auto">{city.eventCount} Events</span>
                  </div>

                  <h3 className="entity-title">{city.name}</h3>
                  <p className="entity-parent-location">📍 {city.country} ({city.countryCode})</p>

                  <div className="entity-breakdown-row">
                    <div className="breakdown-col">
                      <b>{city.venueCount}</b>
                      <span>Venues</span>
                    </div>
                    <div className="breakdown-col">
                      <b>{city.addressCount}</b>
                      <span>Addresses</span>
                    </div>
                  </div>

                  {city.latitude && city.longitude && (
                    <div className="coords-strip">
                      <Compass size={12} />
                      <span>{city.latitude.toFixed(4)}° N, {city.longitude.toFixed(4)}° E</span>
                    </div>
                  )}

                  <div className="card-footer-row">
                    <Link href={`/place/${city.slug}`} className="entity-action-btn">
                      <span>Explore City Chronicles</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: VENUES (TIER 3) */}
      {activeTab === "venues" && (
        <div className="hierarchy-tab-panel" role="tabpanel" aria-label="Venues Tier 3">
          <div className="tier-intro-banner">
            <Building size={24} />
            <div>
              <h3>Tier 3: Named Venues & Institutional Complexes</h3>
              <p>Government buildings, executive residences, parliamentary chambers, and diplomatic summit complexes. Every venue links to its specific street address and sub-areas.</p>
            </div>
          </div>

          {filteredVenues.length === 0 ? (
            <div className="hierarchy-empty-state">
              <p>No venues match your search filters.</p>
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="entity-card-grid venues-grid">
              {filteredVenues.map((venue) => {
                const badge = getVenueTypeBadge(venue.venueType);
                return (
                  <div key={venue.id} className="entity-card venue-card">
                    <div className="card-top-row">
                      <span className={`venue-type-chip ${badge.className}`}>{badge.label}</span>
                      <span className="event-count-badge ml-auto">{venue.eventCount} Events</span>
                    </div>

                    <h3 className="entity-title">{venue.name}</h3>
                    <p className="entity-parent-location">🏛️ {venue.city}, {venue.country}</p>

                    {/* Linked Physical Street Address (CRITICAL) */}
                    {venue.streetAddress ? (
                      <div className="venue-street-address-box">
                        <MapPin size={14} className="address-pin-icon" />
                        <div>
                          <small>Physical Street Address:</small>
                          <p>{venue.streetAddress}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="venue-street-address-box unlinked">
                        <MapPin size={14} className="address-pin-icon" />
                        <div>
                          <small>Physical Address:</small>
                          <p>Central Municipal Jurisdiction, {venue.city}</p>
                        </div>
                      </div>
                    )}

                    {/* Sub-Venue Areas */}
                    {venue.venueAreas && venue.venueAreas.length > 0 && (
                      <div className="venue-sub-areas-container">
                        <small>Key Venue Areas:</small>
                        <div className="area-tags">
                          {venue.venueAreas.map((area) => (
                            <span key={area.id} className="area-tag">
                              {area.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="card-footer-row">
                      <Link href={`/place/${venue.slug}`} className="entity-action-btn">
                        <span>View Venue Dossier</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: STREET ADDRESSES (TIER 4) */}
      {activeTab === "addresses" && (
        <div className="hierarchy-tab-panel" role="tabpanel" aria-label="Addresses Tier 4">
          <div className="tier-intro-banner">
            <MapPin size={24} />
            <div>
              <h3>Tier 4: Physical Street Addresses & Coordinates</h3>
              <p>Exact street, road, and postal locations documented in primary transcripts and official dispatches.</p>
            </div>
          </div>

          {filteredAddresses.length === 0 ? (
            <div className="hierarchy-empty-state">
              <p>No street addresses match your search filters.</p>
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="entity-card-grid addresses-grid">
              {filteredAddresses.map((address) => (
                <div key={address.id} className="entity-card address-card">
                  <div className="card-top-row">
                    <span className="tier-tag address-tag">ADDRESS · TIER 4</span>
                    <span className="event-count-badge ml-auto">{address.eventCount} Events</span>
                  </div>

                  <h3 className="entity-title address-format">{address.formattedAddress}</h3>
                  <p className="entity-parent-location">📍 {address.city}, {address.country}</p>

                  {address.district && (
                    <div className="district-info">
                      <small>District / Ward:</small> <span>{address.district}</span>
                    </div>
                  )}

                  {/* Venues situated at this address */}
                  {address.venuesLocatedHere.length > 0 && (
                    <div className="venues-at-address-card-box">
                      <small>Venues situated here:</small>
                      <ul>
                        {address.venuesLocatedHere.map((v, i) => (
                          <li key={i}>🏛️ <b>{v}</b></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="card-footer-row">
                    <Link href={`/place/${address.slug}`} className="entity-action-btn">
                      <span>Explore Address Events</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
