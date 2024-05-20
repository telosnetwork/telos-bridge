export function isMobile() {
    if (typeof navigator !== 'undefined') {
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
        return mobileRegex.test(navigator.userAgent);
    }
    return false;
}
