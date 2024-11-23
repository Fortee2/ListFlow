# Sales Auction Extension

Sales Auction Extension is a Chrome extension designed to retrieve and manage listings from various auction websites.

## Table of Contents

- [Sales Auction Extension](#sales-auction-extension)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Development](#development)
    - [Project Structure](#project-structure)
    - [Scripts](#scripts)
  - [Contributing](#contributing)
    - [Reporting Issues](#reporting-issues)
    - [Suggesting Features](#suggesting-features)
    - [Submitting Pull Requests](#submitting-pull-requests)
  - [License](#license)

## Description

This Chrome extension allows users to retrieve and manage listings from various auction websites such as eBay, Mercari, Etsy, Poshmark, and more. The extension provides features like downloading images, updating descriptions, and managing listings.

## Installation

To install the extension locally for development:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/sales-auction-extension.git
    cd sales-auction-extension
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Build the project:
    ```sh
    npm run build
    ```

4. Load the extension in Chrome:
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode" in the top right corner.
    - Click on "Load unpacked" and select the `dist` directory.

## Usage

Once the extension is loaded in Chrome, you can use it to retrieve and manage listings from supported auction websites. The extension provides a popup interface and background scripts to handle various tasks.

## Development

To contribute to the development of this extension, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/sales-auction-extension.git
    cd sales-auction-extension
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run build
    ```

4. Make your changes and test them locally by reloading the extension in Chrome.

### Project Structure

/project-root
  /src
    /functions
      /ebay
        scrapDataEbay.ts
        scrapImages.js
        scrapDescription.js
        postage.js
        endListings.js
        copyListing.js
      /mercari
        scrapDataMercari.ts
        mercariConstants.ts
        priceMercari.ts
        itemPageDetails.ts
        removeInactive.ts
        createMercariListing.ts
      /etsy
        scrapDataEtsy.ts
      /district
        createDistrictListing.ts
      /utils
        urls.ts
        utils.ts
        tabs.ts
    interface.ts
    background.js
  tsconfig.json
  package.json
  manifest.json
  webpack.config.js
  LICENSE
  README.md

### Scripts

- `npm run build`: Compiles the TypeScript and JavaScript files using Webpack and cleans the `dist` directory before each build.

## Contributing


### Reporting Issues

If you encounter any issues or have suggestions for improvements, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the issue and any relevant screenshots.

### Suggesting Features

If you have an idea for a new feature, please open an issue on GitHub and describe the feature in detail. We encourage discussion and feedback from the community.

### Submitting Pull Requests

1. **Fork the Repository**: Click the "Fork" button at the top right corner of the repository page to create a copy of the repository in your GitHub account.

2. **Clone the Repository**: Clone your forked repository to your local machine.

3. **Create a Branch**: Create a new branch for your changes.

4. **Make Changes**: Make your changes to the codebase. Follow the coding standards and best practices outlined below.

5. **Commit Changes**: Commit your changes with a clear and descriptive commit message.
    ```sh
    git add .
    git commit -m "Add feature X"
    ```

6. **Push Changes**: Push your changes to your forked repository.
    ```sh
    git push origin my-feature-branch
    ```

7. **Open a Pull Request**: Open a pull request

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.