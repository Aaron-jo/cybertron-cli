import React, { createRef, LegacyRef, useEffect } from 'react';
import Map from '@arcgis/core/Map';
import Camera from '@arcgis/core/Camera';
import SceneView from '@arcgis/core/views/SceneView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { connect } from 'react-redux';
import cs from './App.module.scss';

function App(props: IKV) {
    const mapRef: LegacyRef<HTMLDivElement> = createRef();
    useEffect(() => {
        console.log(props);
        if (mapRef.current) {
            const gLayer = new GraphicsLayer();
            const map = new Map({
                basemap: 'satellite',
                layers: [gLayer],
                ground: 'world-elevation'
            });
            const camera = new Camera({
                position: { longitude: 9.76504392, latitude: 46.43538764, z: 2073.31548 },
                heading: 226.79,
                tilt: 88.35
            });
            const senceView = new SceneView({
                map: map,
                container: mapRef.current
            });
            // 移除ArcGIS的attribution
            senceView.ui.remove('attribution');
            senceView.when(() => {
                senceView.goTo(camera);
            });
        }
    }, [mapRef]);
    return (
        <div>
            <div ref={mapRef} style={{ height: '100vh', width: '100vw' }}></div>
            <div id="timeSlider" style={{ position: 'fixed', bottom: 10, right: 10 }}></div>
        </div>
    );
}
const mapStateToProps = (state: IKV) => ({
    test: state.theDefaultReducer
});
export default connect(mapStateToProps)(App);
