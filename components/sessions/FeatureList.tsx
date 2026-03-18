import { Feature } from '@/lib/types';
import { groupBy } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface FeatureListProps {
  features: Feature[];
  selectable?: boolean;
  selected?: string[];
  onToggle?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
}

export default function FeatureList({ features, selectable, selected = [], onToggle, onSelectAll }: FeatureListProps) {
  const grouped = groupBy(features, 'category');

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, feats]) => {
        const allSelected = feats.every(f => selected.includes(f.id));
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] px-2 py-0.5 bg-slate-100 rounded">
                {category}
              </span>
              {selectable && onSelectAll && (
                <button
                  type="button"
                  onClick={() =>
                    allSelected
                      ? onSelectAll(selected.filter(id => !feats.map(f => f.id).includes(id)))
                      : onSelectAll([...selected, ...feats.map(f => f.id).filter(id => !selected.includes(id))])
                  }
                  className="text-xs text-[#160D76] font-medium hover:underline"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {feats.map(feature => {
                const isSelected = selected.includes(feature.id);
                return (
                  <div
                    key={feature.id}
                    role={selectable ? 'button' : undefined}
                    tabIndex={selectable ? 0 : undefined}
                    onClick={() => selectable && onToggle?.(feature.id)}
                    onKeyDown={e => selectable && e.key === 'Enter' && onToggle?.(feature.id)}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all',
                      selectable && 'cursor-pointer',
                      isSelected || !selectable
                        ? 'border-[#4094d9]/40 bg-[#4094d9]/5'
                        : 'border-[#E2E8F0] bg-white hover:border-[#4094d9]/40'
                    )}
                  >
                    {selectable ? (
                      <div className={clsx(
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                        isSelected ? 'bg-[#160D76] border-[#160D76]' : 'border-[#CBD5E1]'
                      )}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-[#4094d9] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{feature.title}</p>
                      <p className="text-sm text-[#64748B] mt-0.5 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
