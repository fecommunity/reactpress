import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getToolkitClient } from "@/shared/client";

export type SiteSettings = Record<string, unknown>;

const SETTINGS_QUERY_KEY = ["site-settings"];

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const api = await getToolkitClient();
      const data = (await api.setting.findAll()) as SiteSettings;
      return data ?? {};
    },
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (patch: SiteSettings) => {
      const api = await getToolkitClient();
      const current = queryClient.getQueryData<SiteSettings>(SETTINGS_QUERY_KEY) ?? {};
      await api.setting.update({
        body: { ...current, ...patch },
      } as Parameters<typeof api.setting.update>[0]);
      return patch;
    },
    onSuccess: (patch) => {
      queryClient.setQueryData<SiteSettings>(SETTINGS_QUERY_KEY, (prev) => ({
        ...prev,
        ...patch,
      }));
      void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });

  return { ...query, saveMutation };
}
