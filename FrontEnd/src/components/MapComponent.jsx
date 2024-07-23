import useGeolocation2 from '@/hooks/useGeolocation2';
import useKakaoMap2 from '@/hooks/useKakaoMap2';

const MapComponent = () => {
  const { isLoading, location, areaCenter, distance } = useGeolocation2();
  const mapRef = useKakaoMap2(location, isLoading, areaCenter);

  return isLoading ? (
    <div>
      <h1>Loading...</h1>
    </div>
  ) : (
    <div>
      <h3>
        Cnt: {areaCenter.lat}º {areaCenter.lng}º
      </h3>
      <h3>
        Loc: {location.lat}º {location.lng}º
      </h3>
      <h3>Distance: {distance}m</h3>

      <div
        id="map"
        ref={mapRef}
        style={{ width: '100%', height: '500px', border: '1px solid black' }}
      />

      <div id="distance-calc-time"></div>
      <div id="map-init-time"></div>
      <div id="map-update-time"></div>
    </div>
  );
};

export default MapComponent;
