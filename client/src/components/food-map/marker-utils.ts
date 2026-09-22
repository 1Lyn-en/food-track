import type { FoodEntryMapMarker } from '@shared/api.interface';

const PRIMARY_COLOR = 'hsl(48, 100%, 50%)';
const MARKER_TEXT_COLOR = 'hsl(0, 0%, 0%)';

const STAR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:hsl(0,0%,0%);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

const UTENSIL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(0, 0%, 25%)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';

const RATING_STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${PRIMARY_COLOR}" stroke="${PRIMARY_COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export function createMarkerContent(
  marker: FoodEntryMapMarker,
  currentUserId: string | null,
): HTMLElement {
  const isOwn = !currentUserId || marker.userId === currentUserId;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: relative;
    width: 36px;
    height: 46px;
    cursor: pointer;
    transform-origin: center bottom;
    animation: markerBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  if (isOwn) {
    const drop = document.createElement('div');
    drop.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      background: ${PRIMARY_COLOR};
      border: 3px solid #000;
      transform: rotate(-45deg);
      box-shadow: 4px 4px 0 0 #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
    `;

    const starWrap = document.createElement('div');
    starWrap.style.cssText = `
      transform: rotate(45deg);
      color: ${MARKER_TEXT_COLOR};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      gap: 2px;
    `;
    starWrap.innerHTML = `${STAR_SVG}<span style="color:${MARKER_TEXT_COLOR};font-size:11px;font-weight:700;">${marker.rating.toFixed(1)}</span>`;

    drop.appendChild(starWrap);
    wrapper.appendChild(drop);
  } else {
    const bgColor = marker.creatorColor || '#007AFF';
    const initial = (marker.creatorNickname || '?').charAt(0);

    const drop = document.createElement('div');
    drop.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      background: ${bgColor};
      border: 3px solid #000;
      transform: rotate(-45deg);
      box-shadow: 4px 4px 0 0 #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
    `;

    const inner = document.createElement('div');
    inner.style.cssText = `
      transform: rotate(45deg);
      color: #fff;
      font-size: 14px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    inner.textContent = initial;

    drop.appendChild(inner);
    wrapper.appendChild(drop);
  }

  return wrapper;
}

export function createInfoWindowContent(
  marker: FoodEntryMapMarker,
  currentUserId: string | null,
): HTMLElement {
  const isOwn = !currentUserId || marker.userId === currentUserId;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    width: 240px;
    background: white;
    border: 4px solid #000;
    border-radius: 24px;
    box-shadow: 8px 8px 0 0 #000;
    overflow: hidden;
    font-family: inherit;
  `;

  const imgSection = document.createElement('div');
  imgSection.style.cssText = `
    width: 100%;
    height: 120px;
    background: hsl(54, 100%, 88%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;

  if (marker.images && marker.images.length > 0) {
    const img = document.createElement('img');
    img.src = marker.images[0];
    img.alt = marker.dishName;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    img.onerror = () => {
      img.style.display = 'none';
      imgSection.innerHTML = UTENSIL_SVG;
    };
    imgSection.appendChild(img);
  } else {
    imgSection.innerHTML = UTENSIL_SVG;
  }

  const content = document.createElement('div');
  content.style.cssText = 'padding: 12px 14px;';

  if (!isOwn && marker.creatorNickname) {
    const sharer = document.createElement('div');
    sharer.style.cssText =
      'display: flex; align-items: center; gap: 6px; margin-bottom: 8px;';
    const dot = document.createElement('span');
    dot.style.cssText = `
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${marker.creatorColor || '#007AFF'};
      border: 1.5px solid #000;
      flex-shrink: 0;
    `;
    const label = document.createElement('span');
    label.style.cssText =
      'font-size: 11px; font-weight: 700; color: hsl(0, 0%, 40%);';
    label.textContent = `由 ${marker.creatorNickname} 分享`;
    sharer.appendChild(dot);
    sharer.appendChild(label);
    content.appendChild(sharer);
  }

  const restaurant = document.createElement('div');
  restaurant.style.cssText =
    'font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; color: hsl(0, 0%, 0%); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
  restaurant.textContent = marker.restaurantName;

  const dish = document.createElement('div');
  dish.style.cssText =
    'font-size: 13px; font-weight: 700; color: hsl(0, 0%, 25%); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
  dish.textContent = marker.dishName;

  const ratingRow = document.createElement('div');
  ratingRow.style.cssText = 'display: flex; align-items: center; gap: 4px;';
  ratingRow.innerHTML = `${RATING_STAR_SVG}<span style="font-size: 13px; font-weight: 900; color: hsl(0, 0%, 0%);">${marker.rating.toFixed(1)}</span>`;

  content.appendChild(restaurant);
  content.appendChild(dish);
  content.appendChild(ratingRow);

  wrapper.appendChild(imgSection);
  wrapper.appendChild(content);

  return wrapper;
}

export const MARKER_STYLES = `
  @keyframes markerBounce {
    0% { transform: scale(0) translateY(10px); opacity: 0; }
    60% { transform: scale(1.1) translateY(-3px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  .amap-info-close { display: none !important; }
  .amap-info-content { padding: 0 !important; background: transparent !important; }
  .amap-info-sharp { display: none !important; }
`;
