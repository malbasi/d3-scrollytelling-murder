import * as d3 from 'd3'
import * as topojson from 'topojson'
import { debounce } from 'debounce'

const margin = {
  top: 30,
  right: 20,
  bottom: 30,
  left: 50
}

const width = 700 - margin.left - margin.right
const height = 700 - margin.top - margin.bottom

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69'
  ])
Promise.all([
  d3.json(require('./data/Philadelphia.topojson')),
  d3.csv(require('./data/philly-homicides-2012-present.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready ([json, allData]) {
  let neighborhoods = topojson.feature(json, json.objects.Philadelphia)
  let projection = d3.geoMercator().fitSize([width, height], neighborhoods)
  let path = d3.geoPath().projection(projection)

  let t = 500

  var nested = d3
    .nest()
    .key(d => d.year)
    .entries(allData)
  // console.log(nested)

  // show the map
  svg
    .selectAll('.neighborhood')
    .data(neighborhoods.features)
    .enter()
    .append('path')
    .attr('class', 'neighborhood')
    .attr('d', path)
    .attr('stroke', 'black')
    .attr('fill', 'none')

  // d3.select('#murders-2012').on('stepin', () => {
  //   svg
  //     .selectAll('.year1')
  //     .data(nested)
  //     .enter()
  //     .append('circle')
  //     .attr('class', 'year1')
  //     .attr('r', 10)
  //     .attr('cx', 1)
  //     .attr('cy', 1)
  //     .attr('transform', d => {
  //       // console.log(d.values)
  //       if (d.key === '2012') {
  //        console.log(d.values)
  //         // let coords = projection([d.lon, d.lat])
  //         // return `translate(${coords})`
  //       }
  //     })
  // })
  // d3.select('#2012-murders').on('stepin', () => {
  // svg
  //   .selectAll('.')
  //   .data()
  // })
  // d3.select('#2013-murders').on('stepin', () => {
  //   svg
  //     .selectAll('.')
  //     .data()
  // })
  // d3.select('#2014-murders').on('stepin', () => {
  //   svg
  //     .selectAll('.')
  //     .data()
  // })
  // d3.select('#2015-murders').on('stepin', () => {
  //   svg
  //     .selectAll('.')
  //     .data()
  // })
  // d3.select('#2016-murders').on('stepin', () => {
  //   svg
  //     .selectAll('.')
  //     .data()
  // })

  // Show all murders
  d3.select('#all-murders').on('stepin', () => {
    console.log('step in all-murders')
    svg
      .selectAll('.murders')
      .data(allData)
      .enter()
      .append('circle')
      .transition().duration(t)
      .attr('class', 'murders')
      .attr('r', 3)
      .attr('transform', d => {
        let coords = projection([d.lon, d.lat])
        return `translate(${coords})`
      })
      .attr('opacity', 0.5)
      .attr('fill', '#58508d')

    // return dots to blue on step back
    svg
      .selectAll('.murders')
      .transition().duration(t)
      .attr('fill', '#58508d')
  })

  // change colors based on race
  d3.select('#race').on('stepin', () => {
    svg
      .selectAll('.murders')
      .transition().duration(t)
      .attr('fill', d => {
        if (d.victim_race === 'Black') {
          return '#003f5c'
        } if (d.victim_race === 'Asian') {
          return '#7a5195'
        } if (d.victim_race === 'White') {
          return '#ef5675'
        } if (d.victim_race === 'Hispanic') {
          return '#ffa600'
        }
      })
      .attr('r', 3)
  })

  d3.select('#only-arrest').on('stepin', () => {
    svg
      .selectAll('.murders')
      .transition().duration(t)
      .attr('r', d => {
        if (d.disposition === 'Closed by arrest') {
          return 0
        } else {
          return 3
        }
      })
  })
}
