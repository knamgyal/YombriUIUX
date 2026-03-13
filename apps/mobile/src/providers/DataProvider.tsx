import React, { createContext, useContext, useMemo } from "react";
import type { DiscoveryRepo, EventsRepo, GroupsRepo } from "@yombri/domain";
import {
  createLocalDiscoveryRepo,
  createLocalEventsRepo,
  createLocalGroupsRepo,
  createSupabaseDiscoveryRepo,
  createSupabaseEventsRepo,
  createSupabaseGroupsRepo,
} from "@yombri/data";
import { initializeSupabase } from "@yombri/supabase-client";
import { ENV, type DataSource } from "../config/env";

type DataContextValue = {
  discovery: DiscoveryRepo;
  events: EventsRepo;
  groups: GroupsRepo;
  source: DataSource;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const source = ENV.DATA_SOURCE;

  const value = useMemo<DataContextValue>(() => {
    if (source === "supabase") {
      initializeSupabase(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

      return {
        source,
        discovery: createSupabaseDiscoveryRepo(),
        events: createSupabaseEventsRepo(),
        groups: createSupabaseGroupsRepo(),
      };
    }

    return {
      source,
      discovery: createLocalDiscoveryRepo(),
      events: createLocalEventsRepo(),
      groups: createLocalGroupsRepo(),
    };
  }, [source]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
