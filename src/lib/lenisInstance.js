// Shared handle to the single Lenis instance created by useLenis(), so that
// code outside the hook (scrollToSection) can drive scrolling through the
// same instance instead of creating a second, out-of-sync Lenis.
let lenisInstance = null

export function setLenisInstance(instance) {
  lenisInstance = instance
}

export function getLenisInstance() {
  return lenisInstance
}
