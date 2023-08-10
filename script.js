document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const source = document.getElementById("source").value;
      const destination = document.getElementById("destination").value;
  
      findShortestPath(source, destination);
    });
  
    function findShortestPath(source, destination) {
      fetch("data.json")
        .then((response) => response.json())
        .then((data) => {
          const graph = {};
          data.stations.forEach((station) => {
            if (!graph[station.source]) {
              graph[station.source] = {};
            }
            graph[station.source][station.destination] = station.distance;
          });
  
          const shortestPath = dijkstra(graph, source, destination);
          displayResult(shortestPath, data.stations);
        })
        .catch((error) => console.error(error));
    }
  
    function dijkstra(graph, start, end) {
        const INFINITY = 1 / 0; // Infinity
        const nodes = new Set(Object.keys(graph));
        const distances = {};
        const previous = {};
        let path = [];
    
        // Initialize distances with Infinity, except for the start node (0 distance)
        nodes.forEach((node) => {
          distances[node] = node === start ? 0 : INFINITY;
        });
    
        while (nodes.size) {
          let minNode = null;
          for (let node of nodes) {
            if (minNode === null || distances[node] < distances[minNode]) {
              minNode = node;
            }
          }
    
          if (minNode === end) {
            // Reached the destination node, construct the path
            while (previous[minNode]) {
              path.push(minNode);
              minNode = previous[minNode];
            }
            break;
          }
    
          nodes.delete(minNode);
    
          for (let neighbor in graph[minNode]) {
            let newDistance = distances[minNode] + graph[minNode][neighbor];
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance;
              previous[neighbor] = minNode;
            }
          }
        }
    
        // Construct the final result object
        let distance = distances[end];
        path = path.concat(start).reverse();
        return { path, distance };
    }
  
    function displayResult(shortestPath, stations) {
      const resultDiv = document.getElementById("result");
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
  
      // Clear previous drawings
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      const nodeRadius = 20;
      const nodeOffsetX = 50;
      const nodeOffsetY = 50;
  
      if (shortestPath) {
        resultDiv.innerHTML = `
            <p>Shortest Path: ${shortestPath.path.join(" -> ")}</p>
            <p>Distance: ${shortestPath.distance} km</p>
        `;
  
        // Draw nodes and station names
        let x = nodeOffsetX;
        shortestPath.path.forEach((stationName) => {
          const station = stations.find((station) => station.source === stationName);
          context.beginPath();
          context.arc(x, nodeOffsetY, nodeRadius, 0, 2 * Math.PI);
          context.stroke();
          context.fillText(stationName, x - nodeRadius / 2, nodeOffsetY + nodeRadius + 15);
          x += nodeRadius * 2 + 50;
        });
      } else {
        resultDiv.innerHTML = "<p>No path found.</p>";
      }
    }
  });

