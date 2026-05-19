import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./CollegeFilters.css";

const DEFAULT_FILTERS = {
  academicStream: "",
  academicLevel: "",
  department: "",
  course: "",
  location: "",
  transport: "",
  minRating: "",
  maxRating: "",
};

export const CollegeFilters = ({ onFilterChange, initialFilters = {}, onSubmit }) => {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [options, setOptions] = useState({
    academicStreams: [],
    academicLevels: [],
    departments: [],
    courses: [],
    locations: [],
    transportOptions: [],
  });

  useEffect(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      setLoading(true);
      const response = await api.getCollegeOptions();
      if (!mounted) return;
      if (response.success && response.data) {
        setOptions({
          cities: response.data.cities || [],
          states: response.data.states || [],
          types: response.data.types || [],
        });
      } else {
        setError(response.error || "Unable to load filter options.");
      }
      setLoading(false);
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const filterPairs = useMemo(
    () => [
      { key: "academicStream", label: "Academic Stream", type: "select", options: options.academicStreams },
      { key: "academicLevel", label: "Academic Level", type: "select", options: options.academicLevels },
      { key: "department", label: "Department", type: "select", options: options.departments },
      { key: "course", label: "Course", type: "select", options: options.courses },
      { key: "location", label: "Location", type: "select", options: options.locations },
      { key: "transport", label: "Transport Available", type: "select", options: options.transportOptions },
      { key: "minRating", label: "Minimum Rating", type: "number", min: 0, max: 5, step: 0.1 },
      { key: "maxRating", label: "Maximum Rating", type: "number", min: 0, max: 5, step: 0.1 },
    ],
    [options]
  );

  const handleChange = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      onFilterChange?.(next);
      return next;
    });
  };

  const handleReset = () => {
    const next = { ...DEFAULT_FILTERS };
    setFilters(next);
    setError("");
    onFilterChange?.(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(filters);
  };

  return (
    <section className="college-filters">
      <div className="college-filters__header">
        <div>
          <h2>Filter colleges</h2>
          <p>Refine results by location, college type, rating, and tuition.</p>
        </div>
        <button type="button" className="college-filters__reset" onClick={handleReset}>
          Reset filters
        </button>
      </div>

      {loading ? (
        <div className="college-filters__loading">Loading filter options…</div>
      ) : error ? (
        <div className="college-filters__error">{error}</div>
      ) : (
        <form className="college-filters__form" onSubmit={handleSubmit}>
          {filterPairs.map((filter) => (
            <label key={filter.key} className="college-filters__field">
              <span>{filter.label}</span>
              {filter.type === "select" ? (
                <select
                  value={filters[filter.key] || ""}
                  onChange={(event) => handleChange(filter.key, event.target.value)}
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type}
                  value={filters[filter.key] || ""}
                  onChange={(event) => handleChange(filter.key, event.target.value)}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                />
              )}
            </label>
          ))}

          <div className="college-filters__actions">
            <button type="submit" className="college-filters__submit">
              Apply filters
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
