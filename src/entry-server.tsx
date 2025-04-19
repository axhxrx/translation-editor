// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {/* <link rel="stylesheet" href="https://assets.soracom.io/sds/3.0.10/combined/style.css" /> */}
          {assets}
        </head>
        <body>
          <div id="app" class="ds-app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
