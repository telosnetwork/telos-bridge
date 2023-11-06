export function isMobile() {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
    return mobileRegex.test(navigator.userAgent);
}
