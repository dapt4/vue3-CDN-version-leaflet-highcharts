const app = createApp({
  components:{
    find: finderComponent,
  },
  setup() {
    var map;
    var chart;
    var selectedMarker;
    const plotSelected = ref({});
    const zoneSelected = ref({});
    var plots = ref([]);
    var plotsButtons = "";
    const chartData = ref([])
    const chartContainer = ref(null)
    const findParam = "plotname"
    const normal = L.ExtraMarkers.icon({
      icon: "fa-microchip",
      markerColor: "orange",
      shape: "penta",
      prefix: "fa-solid",
    });
    const selected = L.ExtraMarkers.icon({
      icon: "fa-microchip",
      markerColor: "green",
      shape: "square",
      prefix: "fa-solid",
    });
    const initMap = async () => {
      plots.value = await getPlotsData();
      plotSelected.value = plots.value[0];
      map = L.map("map").setView([51.505, -0.09], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      renderGeojsonAndMarkers(plots.value);
    };
    const getPlotsData = async () => {
      const res = await fetch("plots.json");
      return await res.json();
    };
    const renderGeojsonAndMarkers = (arr) => {
      arr.forEach((plot, index) => {
        let geo = L.geoJSON(plot.geojson).addTo(map);
        if (index === 0) map.fitBounds(geo.getBounds());
        plot.zones.forEach((zone) => {
          let marker = L.marker([zone.lat, zone.lng], { icon: normal }).addTo(
            map
          );
          marker.on("click", () =>
            selectEstation(plot.plotid, marker, zone.id)
          );
        });
      });
    };
    const selectEstation = (plotid, marker, zoneid) => {
      if (plotid !== plotSelected.value.plotid) selectPlot(plotid);
      marker && marker.setIcon(selected);
      selectedMarker && selectedMarker.setIcon(normal);
      selectedMarker = marker;
      zoneSelected.value = getDataFromState(plotid, zoneid);
      initChart(zoneid);
    };
    const initChart = async (id) => {
      const data = await getChartData(id);
      chart = Highcharts.chart("chart", data);
    };
    const getChartData = async (id) => {
      const url = "chart.json?id=" + id;
      const res = await fetch(url);
      return await res.json();
    };
    const selectPlot = (plotid) => {
      selectedMarker && selectedMarker.setIcon(normal);
      let target = getDataFromState(plotid, undefined);
      map.fitBounds(L.geoJSON(target.geojson).getBounds());
      plotSelected.value = target;
      chartContainer.value.innerHTML = ""
      zoneSelected.value = {}
    };
    const getDataFromState = (plotid, zoneid) => {
      let result = null;
      plots.value.forEach((plot) => {
        if (plotid === plot.plotid) {
          result = plot;
          if (zoneid !== undefined) {
            plot.zones.forEach((zone) => {
              if (zone.id === zoneid) {
                result = zone;
              }
            });
          }
        }
      });
      return result;
    };
    onMounted(() => {
      initMap();
    });
    return {
      plots,
      plotSelected,
      plotsButtons,
      selectPlot,
      zoneSelected,
      chartContainer,
      findParam,
    };
  },
  template: `
  <section class="container">
    <div class="finder">
      <find :data="plots" :selectFunc="selectPlot" :findParam="findParam"/>
    </div>
    <div id="buttons" class="buttons">
      <button @click="selectPlot(plot.plotid)" v-for="plot of plots" :class="[ plotSelected.plotid === plot.plotid ? 'active' : '']">
        {{plot.plotname}}
      </button>
    </div>
    <div id="map"></div>
    <div class="card">
      <div class="card-body">
        <h1>{{plotSelected.plotname}} - {{zoneSelected.name}}
      </div>
    </div>
    <div id="chart" ref="chartContainer"></div>
  </section>
  `,
});

app.mount("#app");


