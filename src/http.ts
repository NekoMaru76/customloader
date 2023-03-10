import { Loader } from "./loader.ts";

const textEncoder = new TextEncoder();

export async function serveHTTP({
    req,
    parse,
}: {
    parse: ReturnType<Loader["createParseHTTPFromFile"]>;
    req: Request;
}) {
    try {
        const ret = await parse(req);
        let buf: Uint8Array;

        if ("uri" in ret) {
            buf = await fetch(ret.uri)
                .then((res) => res.blob())
                .then((blob) => blob.arrayBuffer())
                .then((arr) => new Uint8Array(arr));
        } else if ("root" in ret) {
            buf = await Deno.readFile(ret.root);
        } else if ("code" in ret) {
            buf = textEncoder.encode(ret.code);
        } else {
            buf = ret.buf;
        }

        return new Response(buf, {
            headers: {
                "Content-Type": ret.contentType,
            },
        });
    } catch (e) {
        return new Response(e.toString(), {
            status: 404,
        });
    }
}
