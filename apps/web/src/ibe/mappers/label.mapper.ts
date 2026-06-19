import type { IbeLabels } from "../types/label.types";

type IbeLabelDocuments = {
  flightSearch: {
    data: {
      airport: Array<{
        label?: string | null;
        name?: string | null;
      }>;
      flight_search_ptc?: string | null;
    };
  };
  flightSelect: {
    data: {
      flight_select_from_date?: string | null;
      flight_select_to_date?: string | null;
    };
  };
};

export type IbeLabelMapperInput = IbeLabelDocuments;

export function mapIbeLabels(documents: IbeLabelDocuments): IbeLabels {
  const { flightSearch, flightSelect } = documents;
  const airportItem = flightSearch.data.airport[0];

  return {
    flight_search: {
      airport: {
        label: String(airportItem?.label ?? ""),
        name: String(airportItem?.name ?? ""),
      },
      ptc: String(flightSearch.data.flight_search_ptc ?? ""),
    },
    flight_select: {
      from_date: String(flightSelect.data.flight_select_from_date ?? ""),
      to_date: String(flightSelect.data.flight_select_to_date ?? ""),
    },
  };
}
