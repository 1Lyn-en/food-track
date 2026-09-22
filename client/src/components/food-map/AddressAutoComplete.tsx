import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAmapService } from '@/hooks/use-amap';

export interface AddressSuggestion {
  name: string;
  district: string;
  address: string;
  longitude: number | null;
  latitude: number | null;
}

interface AddressAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutoComplete({
  value,
  onChange,
  onSelect,
  placeholder = '输入地址关键词，自动匹配',
  className,
}: AddressAutoCompleteProps) {
  const { amap, hasKey } = useAmapService();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoCompleteRef = useRef<AMap.AutoComplete | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextSearchRef = useRef(false);

  const autoComplete = useMemo(() => {
    if (!amap) return null;
    if (!autoCompleteRef.current) {
      autoCompleteRef.current = new amap.AutoComplete({});
    }
    return autoCompleteRef.current;
  }, [amap]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runSearch = (keyword: string): void => {
    if (!autoComplete || !keyword.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    autoComplete.search(keyword, (status: string, result) => {
      setLoading(false);
      if (status === 'complete' && result?.tips) {
        const list: AddressSuggestion[] = result.tips
          .filter((tip) => tip.name)
          .map((tip) => ({
            name: tip.name,
            district: tip.district ?? '',
            address:
              typeof tip.address === 'string' ? tip.address : '',
            longitude: tip.location ? tip.location.getLng() : null,
            latitude: tip.location ? tip.location.getLat() : null,
          }));
        setSuggestions(list);
        setActiveIndex(-1);
        setOpen(list.length > 0);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.value;
    onChange(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(next), 300);
  };

  const handleSelect = (suggestion: AddressSuggestion): void => {
    const fullText = suggestion.district
      ? `${suggestion.district}${suggestion.name}`
      : suggestion.name;
    suppressNextSearchRef.current = true;
    onChange(fullText);
    onSelect({ ...suggestion, name: fullText });
    setOpen(false);
    setSuggestions([]);
    if (suggestion.longitude === null || suggestion.latitude === null) {
      logger.warn('所选地址缺少经纬度信息', suggestion.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={hasKey ? placeholder : '详细地址'}
          autoComplete="off"
          className="rounded-xl border-4 border-black pr-9 font-bold focus-visible:ring-0"
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-black/50" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto pop-scrollbar rounded-xl border-4 border-black bg-white shadow-[6px_6px_0_0_#000]">
          {suggestions.map((s, index) => (
            <li key={`${s.name}-${index}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className={cn(
                  'flex w-full items-start gap-2 px-3 py-2 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-[#FFDE00]'
                    : 'hover:bg-[#FFF9C4]',
                )}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3B30]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-black">
                    {s.name}
                  </span>
                  {(s.district || s.address) && (
                    <span className="block truncate text-xs font-bold text-black/50">
                      {s.district}
                      {s.address ? ` · ${s.address}` : ''}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
