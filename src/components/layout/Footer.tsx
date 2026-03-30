export function Footer() {
  return (
    <footer className="border-t border-gray-800 px-4 py-4 text-center text-xs text-gray-600">
      <p>Weather data from <a href="https://open-meteo.com" className="text-gray-500 hover:text-gray-400 underline" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · Location from OpenStreetMap</p>
      <p className="mt-1">For recreational use only. Always check local regulations before flying.</p>
    </footer>
  )
}
