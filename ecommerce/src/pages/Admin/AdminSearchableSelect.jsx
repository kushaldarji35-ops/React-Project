import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoCloseCircleOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import "./AdminSearchableSelect.css";

export default function AdminSearchableSelect({
  value,
  onChange,
  options: propOptions,
  children,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className = "",
  name = "",
  disabled = false,
  required = false,
  id,
  style,
  allowClear = false,
  dropUp = false,
  placement: propPlacement,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [placement, setPlacement] = useState(propPlacement || (dropUp ? "top" : "bottom"));
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Extract options from either propOptions or children <option> elements
  const allOptions = useMemo(() => {
    if (propOptions && Array.isArray(propOptions)) {
      return propOptions.map((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return {
            value: opt.value !== undefined ? String(opt.value) : "",
            label: opt.label !== undefined ? String(opt.label) : String(opt.value || ""),
          };
        }
        return { value: String(opt), label: String(opt) };
      });
    }

    if (children) {
      const extracted = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          extracted.push({
            value: child.props.value !== undefined ? String(child.props.value) : "",
            label: child.props.children !== undefined ? String(child.props.children) : String(child.props.value || ""),
          });
        }
      });
      return extracted;
    }

    return [];
  }, [propOptions, children]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null) return null;
    const strVal = String(value);
    return allOptions.find((opt) => opt.value === strVal) || null;
  }, [allOptions, value]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return allOptions;
    const term = searchTerm.toLowerCase();
    return allOptions.filter((opt) =>
      opt.label.toLowerCase().includes(term) || opt.value.toLowerCase().includes(term)
    );
  }, [allOptions, searchTerm]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input and determine placement on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      // Auto-detect placement if not explicitly forced
      if (propPlacement) {
        setPlacement(propPlacement);
      } else if (dropUp) {
        setPlacement("top");
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownEstHeight = 220;
        const spaceBelowWindow = window.innerHeight - rect.bottom;
        const spaceAboveWindow = rect.top;

        // Check closest scrollable modal/container
        const scrollParent = containerRef.current.closest(
          ".adm-modal, .adm-modal-body, .adm-table-responsive"
        );
        let spaceBelowContainer = spaceBelowWindow;
        let spaceAboveContainer = spaceAboveWindow;

        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          spaceBelowContainer = parentRect.bottom - rect.bottom;
          spaceAboveContainer = rect.top - parentRect.top;
        }

        const availableBelow = Math.min(spaceBelowWindow, spaceBelowContainer);
        const availableAbove = Math.min(spaceAboveWindow, spaceAboveContainer);

        if (availableBelow < dropdownEstHeight && availableAbove > availableBelow) {
          setPlacement("top");
        } else {
          setPlacement("bottom");
        }
      }
    } else {
      setSearchTerm("");
      if (!propPlacement && !dropUp) {
        setPlacement("bottom");
      }
    }
  }, [isOpen, propPlacement, dropUp]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option, e) => {
    if (e) e.stopPropagation();
    if (disabled) return;

    setIsOpen(false);
    setSearchTerm("");

    if (onChange) {
      const syntheticEvent = {
        target: { name, value: option.value },
        currentTarget: { name, value: option.value },
        stopPropagation: () => {},
        preventDefault: () => {},
      };
      onChange(syntheticEvent, option.value);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (onChange) {
      const syntheticEvent = {
        target: { name, value: "" },
        currentTarget: { name, value: "" },
        stopPropagation: () => {},
        preventDefault: () => {},
      };
      onChange(syntheticEvent, "");
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`adm-searchable-select ${isOpen ? "adm-searchable-select--open" : ""} ${
        disabled ? "adm-searchable-select--disabled" : ""
      } ${className}`}
      style={style}
      id={id}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form submission if name is provided */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value !== undefined && value !== null ? value : ""}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <div
        className="adm-searchable-select-trigger"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`adm-searchable-select-label ${
            !selectedOption || selectedOption.value === "" ? "adm-searchable-select-placeholder" : ""
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="adm-searchable-select-icons">
          {allowClear && selectedOption && selectedOption.value !== "" && !disabled && (
            <button
              type="button"
              className="adm-searchable-select-clear"
              onClick={handleClear}
              title="Clear selection"
            >
              <IoCloseCircleOutline size={16} />
            </button>
          )}
          <span className={`adm-searchable-select-arrow ${isOpen ? "adm-searchable-select-arrow--open" : ""}`}>
            <IoChevronDownOutline size={16} />
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`adm-searchable-select-dropdown ${
            placement === "top" ? "adm-searchable-select-dropdown--top" : ""
          } animate-fadeIn`}
        >
          {/* Search Bar */}
          <div className="adm-searchable-select-search-wrap">
            <IoSearchOutline className="adm-searchable-select-search-icon" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              className="adm-searchable-select-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="adm-searchable-select-search-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
              >
                <IoCloseCircleOutline size={14} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div ref={listRef} className="adm-searchable-select-options-list" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && selectedOption.value === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`adm-searchable-select-option ${
                      isSelected ? "adm-searchable-select-option--selected" : ""
                    }`}
                    onClick={(e) => handleSelect(opt, e)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="adm-searchable-select-option-text">{opt.label}</span>
                    {isSelected && (
                      <IoCheckmarkOutline className="adm-searchable-select-option-check" size={16} />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="adm-searchable-select-empty">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
