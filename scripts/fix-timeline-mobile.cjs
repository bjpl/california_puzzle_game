const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'study', 'EnhancedStudyMode.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Add showMobileBottomSheet state after showMapCountyList
content = content.replace(
  /(\s+const \[showMapCountyList, setShowMapCountyList\] = useState\(false\);)/,
  '$1\n  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);'
);

// 2. Update Timeline mode container - make it responsive
content = content.replace(
  /<div className="flex-1 flex gap-6 bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-950 overflow-hidden p-8">/,
  '<div className={`flex-1 flex ${isMobile ? \'flex-col\' : \'gap-6\'} bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-950 overflow-hidden p-4 sm:p-6 md:p-8`}>'
);

// 3. Update Timeline header
content = content.replace(
  /<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">\s+📅 California Counties Timeline\s+<\/h2>/,
  '<h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">\n                📅 California Counties Timeline\n              </h2>'
);

// 4. Update Timeline subheader
content = content.replace(
  /<p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">\s+Click any county to view detailed information →\s+<\/p>/,
  '<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5">\n                {isMobile ? \'Tap any county to view details\' : \'Click any county to view detailed information →\'}\n              </p>'
);

// 5. Update decade header styling
content = content.replace(
  /<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">/g,
  '<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold shadow-lg text-base sm:text-lg md:text-xl">'
);

// 6. Update decade header spacing
content = content.replace(
  /<div className="flex-1 h-0\.5 bg-gradient-to-r from-gray-300 to-transparent ml-4"><\/div>/g,
  '<div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent ml-2 sm:ml-4"></div>'
);

// 7. Update counties container
content = content.replace(
  /<div className="flex flex-wrap gap-3 ml-6">/g,
  '<div className={`flex flex-wrap gap-2 sm:gap-3 ${isMobile ? \'ml-0\' : \'ml-6\'}`}>'
);

// 8. Update county button click handler and styling
content = content.replace(
  /onClick=\{\(\) => handleCountySelect\(county\)\}\s+className=\{`min-w-\[140px\] max-w-\[180px\] p-3 rounded-xl border-2/,
  'onClick={() => {\n                                handleCountySelect(county);\n                                if (isMobile) {\n                                  setShowMobileBottomSheet(true);\n                                }\n                              }}\n                              className={`${isMobile ? \'flex-1 min-w-[calc(50%-0.25rem)]\' : \'min-w-[140px] max-w-[180px]\'} p-2.5 sm:p-3 rounded-xl border-2'
);

// 9. Update county button text sizes
content = content.replace(
  /<div className="text-sm font-semibold text-gray-800 dark:text-gray-200">\s+\{county\.name\}\s+<\/div>\s+<div className="text-xs text-gray-500 dark:text-gray-400 font-medium">/g,
  '<div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">\n                                {county.name}\n                              </div>\n                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium"'
);

// 10. Update selected indicator to hide on mobile
content = content.replace(
  /\{selectedCounty\?\.id === county\.id && \(\s+<div className="mt-0\.5">\s+<span className="text-xs text-blue-600 font-bold">\s+✓ Selected\s+<\/span>\s+<\/div>\s+\)\}/g,
  '{selectedCounty?.id === county.id && !isMobile && (\n                                <div className="mt-0.5">\n                                  <span className="text-xs text-blue-600 font-bold">\n                                    ✓ Selected\n                                  </span>\n                                </div>\n                              )}'
);

// 11. Wrap the Right Side Panel in !isMobile condition
content = content.replace(
  /\{\/\* Right Side Panel for County Details \*\/\}\s+<div className="w-80 flex-shrink-0">/,
  '{/* Right Side Panel for County Details - Desktop Only */}\n            {!isMobile && (\n              <div className="w-80 flex-shrink-0">'
);

// 12. Add closing bracket for !isMobile condition and add mobile bottom sheet before closing Timeline mode
const timelineEndPattern = /(\s+<\/div>\s+<\/div>\s+<\/div>\s+\)\}\s+<\/div>\s+<\/div>\s+\)\}\s+)\{\/\* Formation Mode/;
const mobileBottomSheetCode = `              )}

            {/* Mobile Bottom Sheet - Slides up from bottom */}
            {isMobile && showMobileBottomSheet && selectedCounty && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                  onClick={() => setShowMobileBottomSheet(false)}
                />

                {/* Bottom sheet */}
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto shadow-2xl">
                  {/* Drag handle */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 pt-3 pb-2 flex justify-center border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-4">
                      {/* Header with County Shape */}
                      <div className="flex items-start gap-3 mb-3">
                        <CountyShapeDisplay
                          countyId={selectedCounty.id}
                          size={60}
                          className="flex-shrink-0 shadow-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {selectedCounty.name} County
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {selectedCounty.region}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowMobileBottomSheet(false)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
                          <span>📅</span> Established
                        </h4>
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedCounty.founded || selectedCounty.established || 'Unknown'}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                          <span>🏛️</span> County Seat
                        </h4>
                        <p className="text-lg font-semibold text-purple-700">
                          {selectedCounty.capital || selectedCounty.countySeat || 'N/A'}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <h4 className="font-bold text-green-900 mb-1 text-sm flex items-center gap-2">
                          <span>📍</span> Region
                        </h4>
                        <p className="text-base font-medium text-green-700">
                          {selectedCounty.region || 'N/A'}
                        </p>
                      </div>

                      {selectedCounty.population && (
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                          <h4 className="font-bold text-amber-900 mb-1 text-sm flex items-center gap-2">
                            <span>👥</span> Population
                          </h4>
                          <p className="text-base font-semibold text-amber-700">
                            {selectedCounty.population.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {(() => {
                        const educationContent =
                          getCountyEducationComplete(selectedCounty.id) ||
                          getCountyEducation(selectedCounty.id);
                        return educationContent ? (
                          <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                            <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                              <span>📚</span> Historical Context
                            </h4>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {educationContent.historicalContext}
                            </p>
                          </div>
                        ) : null;
                      })()}

                      {selectedCounty.funFacts && selectedCounty.funFacts.length > 0 && (
                        <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                          <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                            <span>✨</span> Fun Facts
                          </h4>
                          <ul className="space-y-1">
                            {selectedCounty.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                              <li key={idx} className="text-xs text-yellow-800 flex gap-1.5">
                                <span className="text-yellow-600">•</span>
                                <span>{fact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Formation Mode`;

content = content.replace(timelineEndPattern, mobileBottomSheetCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Timeline mode mobile responsiveness applied successfully!');
