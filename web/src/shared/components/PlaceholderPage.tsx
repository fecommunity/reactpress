import { useTranslation } from 'react-i18next';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

type PlaceholderPageProps = {
  titleKey: string;
  descriptionKey?: string;
  titleParams?: Record<string, string>;
};

export function PlaceholderPage({ titleKey, descriptionKey, titleParams }: PlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <ModulePlaceholder
      title={t(titleKey, titleParams)}
      description={descriptionKey ? t(descriptionKey) : undefined}
    />
  );
}
