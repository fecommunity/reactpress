import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchThemeConfiguration,
  fetchThemeConfigurationSchema,
  patchThemeConfiguration,
} from "@/shared/api/themes";

const configKey = (themeId: string) => ["theme-configuration", themeId] as const;

export function useThemeConfigurationSchema(themeId: string | undefined) {
  return useQuery({
    queryKey: [...configKey(themeId ?? ""), "schema"],
    queryFn: () => fetchThemeConfigurationSchema(themeId!),
    enabled: Boolean(themeId),
    staleTime: 60_000,
  });
}

export function useThemeConfiguration(themeId: string | undefined) {
  return useQuery({
    queryKey: configKey(themeId ?? ""),
    queryFn: () => fetchThemeConfiguration(themeId!),
    enabled: Boolean(themeId),
  });
}

export function useThemeConfigurationMutation(themeId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { configuration: Record<string, unknown>; replace?: boolean }) =>
      patchThemeConfiguration(themeId!, input.configuration, { replace: input.replace }),
    onSuccess: (data) => {
      queryClient.setQueryData(configKey(themeId!), data);
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}
