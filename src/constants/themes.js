export const THEMES = [
  {
    name: "Default",
    cardHeight: 82 + 3 * 2,
    cardWidth: 250,
    thumbSize: 82,
    labelFontSize: 13,
    contentWidth: 162,
    cardPadding: 3,
    showDescription: true,
    cardVerticalSpacing: 80,
  },
  {
    name: "Big",
    cardHeight: 84,
    cardWidth: 240,
    thumbSize: 84,
    labelFontSize: 16,
    contentWidth: 156,
    showDescription: true,
    cardPadding: 0,
    cardVerticalSpacing: 80,
  },
  {
    name: "Light",
    cardHeight: 84,
    cardWidth: 240,
    thumbSize: 84,
    labelFontSize: 16,
    contentWidth: 156,
    showDescription: true,
    cardPadding: 0,
    cardVerticalSpacing: 80,
    backgroundColor: 'rgb(250, 238, 222)',
  },
  { name: "Dark", disabled: true },
  {
    name: "Only Label",
    cardHeight: 84,
    cardWidth: 200,
    thumbSize: 84,
    labelFontSize: 22,
    contentWidth: 156,
    showDescription: "none",
    cardPadding: 0,
    cardVerticalSpacing: 60,
  },
];
