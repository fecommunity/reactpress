import { Button, Flex, Popover, theme, Tooltip } from "antd";
import { ListFilter } from "lucide-react";
import { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

export type FilterToolbarSlot = {
  key: string;
  /** Used to decide how many filters fit in one row before the rest go into the popover */
  minWidth: number;
  children: React.ReactNode;
};

export type FilterToolbarProps = {
  slots: FilterToolbarSlot[];
  /** Right side: primary actions (not collapsed) */
  actions: React.ReactNode;
  /** Reserve width for the “more filters” control when some slots are in the popover */
  collapseTriggerReserve?: number;
  /** Accessible label + optional popover title */
  moreFiltersLabel: React.ReactNode;
  moreFiltersTitle?: React.ReactNode;
};

function maxVisibleSlots(
  slotWidths: number[],
  availableForLeft: number,
  innerGap: number,
  triggerReserve: number,
): number {
  const n = slotWidths.length;
  if (n === 0) return 0;
  const sum = (count: number) => {
    let s = 0;
    for (let i = 0; i < count; i++) s += slotWidths[i] ?? 0;
    return s;
  };
  const inlineCost = (m: number) => {
    if (m <= 0) return 0;
    return sum(m) + (m - 1) * innerGap;
  };
  const totalLeft = (m: number) => {
    if (m <= 0) return n > 0 ? triggerReserve : 0;
    const base = inlineCost(m);
    if (m >= n) return base;
    return base + innerGap + triggerReserve;
  };
  for (let m = n; m >= 0; m--) {
    if (totalLeft(m) <= availableForLeft) return m;
  }
  return 0;
}

export const FilterToolbar = forwardRef<HTMLDivElement, FilterToolbarProps>(function FilterToolbar(
  { slots, actions, collapseTriggerReserve = 40, moreFiltersLabel, moreFiltersTitle },
  ref,
) {
  const { token } = theme.useToken();
  const gap = token.marginSM;
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(slots.length);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const widths = useMemo(() => slots.map((s) => s.minWidth), [slots]);

  const assignRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const remeasure = useCallback(() => {
    const root = containerRef.current;
    const act = actionsRef.current;
    if (!root) return;
    const actionsW = act?.offsetWidth ?? 0;
    const hasActions = Boolean(act);
    const between = hasActions ? gap : 0;
    const available = Math.max(0, root.clientWidth - actionsW - between);
    const next = maxVisibleSlots(widths, available, gap, collapseTriggerReserve);
    setVisibleCount((prev) => (prev === next ? prev : next));
  }, [widths, gap, collapseTriggerReserve]);

  useLayoutEffect(() => {
    remeasure();
    const root = containerRef.current;
    const act = actionsRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(root);
    if (act) ro.observe(act);
    return () => ro.disconnect();
  }, [remeasure, slots.length, widths]);

  useLayoutEffect(() => {
    setPopoverOpen(false);
  }, [visibleCount]);

  const overflowSlots = slots.slice(visibleCount);
  const inlineSlots = slots.slice(0, visibleCount);

  const popoverContent =
    overflowSlots.length > 0 ? (
      <Flex vertical gap={token.marginMD} style={{ width: "100%" }}>
        {overflowSlots.map((slot) => (
          <div key={slot.key} style={{ minWidth: slot.minWidth }}>
            {slot.children}
          </div>
        ))}
      </Flex>
    ) : null;

  return (
    <Flex
      ref={assignRef}
      wrap={false}
      gap={gap}
      align="center"
      justify="space-between"
      style={{ flexShrink: 0, minWidth: 0 }}
    >
      <Flex
        wrap={false}
        gap={gap}
        align="center"
        style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}
      >
        {inlineSlots.map((slot) => (
          <div
            key={slot.key}
            style={{
              flex: "0 0 auto",
              minWidth: slot.minWidth,
              maxWidth: "100%",
            }}
          >
            {slot.children}
          </div>
        ))}
        {overflowSlots.length > 0 ? (
          <Popover
            title={moreFiltersTitle ?? moreFiltersLabel}
            content={popoverContent}
            trigger="click"
            placement="bottomLeft"
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            overlayInnerStyle={{ maxWidth: "min(100vw - 32px, 360px)" }}
          >
            <Tooltip title={moreFiltersLabel}>
              <Button
                type="default"
                icon={<ListFilter size={token.fontSize} />}
                aria-label={typeof moreFiltersLabel === "string" ? moreFiltersLabel : undefined}
                style={{ flex: "0 0 auto" }}
              />
            </Tooltip>
          </Popover>
        ) : null}
      </Flex>
      <Flex ref={actionsRef} wrap={false} gap={gap} align="center" style={{ flexShrink: 0 }}>
        {actions}
      </Flex>
    </Flex>
  );
});
