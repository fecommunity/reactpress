import { SearchIcon, TOOLBAR_ICON_SIZE, ToolbarIconButton } from '@fecommunity/reactpress-toolkit/ui';

type Props = {
  onClick: () => void;
};

export function HeaderSearch({ onClick }: Props) {
  return (
    <ToolbarIconButton onClick={onClick} aria-label="Search">
      <SearchIcon size={TOOLBAR_ICON_SIZE} />
    </ToolbarIconButton>
  );
}
