import ReactMarkdown from "react-markdown";
import { Link } from "react-router";

import description from "./Description.md?raw";

const headingClassName = "text-3xl font-bold mb-4";
const paragraphClassName = "mb-4 leading-relaxed";

export function Description() {
    return (
        <div className="max-w-3xl mx-auto text-white mt-5">
            <ReactMarkdown
                components={{
                    h1: (props) => <h1 className={headingClassName} {...props} />,
                    h2: (props) => <h2 className="text-2xl font-bold mb-3" {...props} />,
                    h3: (props) => <h3 className="text-xl font-bold mb-2" {...props} />,
                    p: (props) => <p className={paragraphClassName} {...props} />,
                    strong: (props) => <strong className="font-semibold" {...props} />,
                    em: (props) => <em className="italic" {...props} />,
                    code: (props) => <code className="bg-gray-800 px-1 py-0.5 rounded" {...props} />,
                }}
            >
                {description}
            </ReactMarkdown>
            <div className="mx-auto w-1/4 pb-5">
                <Link to="/app" className="mx-auto inline-block mt-6 rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                    Let's Go!
                </Link>
            </div>
        </div>
    );
}