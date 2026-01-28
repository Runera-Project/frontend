interface MapPreviewProps {
  isRecording: boolean;
}

export default function MapPreview({ isRecording }: MapPreviewProps) {
  return (
    <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 400 300">
            {/* Grid lines to simulate map */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#grid)" />
            
            {/* Street labels */}
            <text x="50" y="80" fontSize="8" fill="#666" opacity="0.6">Main Street</text>
            <text x="200" y="150" fontSize="8" fill="#666" opacity="0.6">Park Avenue</text>
            <text x="100" y="220" fontSize="8" fill="#666" opacity="0.6">River Road</text>
          </svg>
        </div>

        {/* Running Route */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300">
          <path
            d="M 80 150 Q 120 100, 180 120 T 280 140 Q 320 160, 320 200 L 280 220 Q 240 230, 180 210 T 100 180 Q 80 170, 80 150"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isRecording ? 'animate-pulse' : ''}
          />
          
          {/* Start Point */}
          <circle cx="80" cy="150" r="6" fill="#10B981" stroke="white" strokeWidth="2" />
          
          {/* Current Position (only when recording) */}
          {isRecording && (
            <g>
              <circle cx="320" cy="200" r="8" fill="#3B82F6" opacity="0.3">
                <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="320" cy="200" r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Map Label */}
        <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
          Live Route
        </div>
      </div>
    </div>
  );
}
