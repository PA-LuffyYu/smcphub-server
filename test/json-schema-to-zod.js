import z from "zod";
import { jsonSchemaToZod } from "json-schema-to-zod";

console.log(
  jsonSchemaToZod({
    type: "object",
    properties: {
      city: {
        type: "string",
        maxLength: 20,
        description: "城市名称",
        default: null,
      },
    },
    required: ["city"],
    additionalProperties: false,
  })
);
