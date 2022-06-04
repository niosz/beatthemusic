const { i18n } = require("./next-i18next.config");
// const withPWA = require("next-pwa");

module.exports = async (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    reactStrictMode: true,
    i18n,
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
  };
  return nextConfig;
  // return withPWA({
  //   ...nextConfig,
  //   pwa: {
  //     dest: "public",
  //   },
  // });
};
