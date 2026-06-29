import type { PopularRoutesProps } from "../../types/slice.types";

export function PopularRoutes({ labels }: PopularRoutesProps) {
  return (
    <section>
      <h2>{labels?.title}</h2>
      {labels?.viewAll ? <a href="/routes">{labels.viewAll}</a> : null}
    </section>
  );
}

export default PopularRoutes;
