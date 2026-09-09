import React, { Suspense, lazy } from "react";
import GlobeLoader from "./GlobeLoader";

const GlobeCore = lazy(() => import("./GlobeCore"));

export default function GlobeViewer({
  waypoints = [],
  liveFlights = [],
  simulated4DFlights = [],
  theme = "space",
  activeOverlayLayer = "none",
  showWindVectors = false,
  isCockpitView = false,
  cockpitProgress = 0.5,
  onPointClick,
  hoveredFlightPath = null,
}) {
  return (
    <Suspense fallback={<GlobeLoader />}>
      <GlobeCore
        waypoints={waypoints}
        liveFlights={liveFlights}
        simulated4DFlights={simulated4DFlights}
        theme={theme}
        activeOverlayLayer={activeOverlayLayer}
        showWindVectors={showWindVectors}
        isCockpitView={isCockpitView}
        cockpitProgress={cockpitProgress}
        onPointClick={onPointClick}
        hoveredFlightPath={hoveredFlightPath}
      />
    </Suspense>
  );
}
