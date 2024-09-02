import { Col, Row } from "@canonical/react-components";
import {
  BundleCard,
  CharmCard,
  LoadingCard,
} from "@canonical/store-components";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const search = new URLSearchParams(window.location.search).get("q");
  const [loading, setLoading] = useState(true);

  const [term, setTerm] = useState(search || "");

  const [results, setResults] = useState<any>({
    charms: [],
    bundles: [],
    docs: [],
    topics: [],
  });

  useEffect(() => {
    if (!search) return;
    fetch(`/all-search.json?q=${search}&limit=4`)
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  const { charms, bundles, docs, topics } = results;

  return (
    <>
      <section id="search-docs" className="p-strip is-shallow">
        <div className="row">
          <form
            className="p-search-box u-no-margin--bottom"
            action="/all-search"
          >
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              type="search"
              className="p-search-box__input"
              name="q"
              placeholder="Search Charmhub"
              required
            />
            <button type="reset" className="p-search-box__reset">
              <i className="p-icon--close">Reset</i>
            </button>
            <button type="submit" className="p-search-box__button">
              <i className="p-icon--search">Search</i>
            </button>
          </form>
        </div>
      </section>
      {search ? (
        <div className="row">
          <section className="p-section">
            <h2>Charms</h2>
            <Row>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Col size={3} style={{ marginBottom: "1.5rem" }} key={i}>
                    <LoadingCard />
                  </Col>
                ))
              ) : charms.length ? (
                charms.map((charm: any) => (
                  <Col
                    size={3}
                    style={{ marginBottom: "1.5rem" }}
                    key={charm.id}
                  >
                    <CharmCard data={charm} />
                  </Col>
                ))
              ) : (
                <p>No charms matching this search</p>
              )}
            </Row>
          </section>
          <section className="p-section">
            <h2>Bundles</h2>
            <Row>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Col size={3} style={{ marginBottom: "1.5rem" }} key={i}>
                    <LoadingCard />
                  </Col>
                ))
              ) : bundles.length ? (
                bundles.map((bundle: any) => (
                  <Col
                    size={3}
                    style={{ marginBottom: "1.5rem" }}
                    key={bundle.id}
                  >
                    <BundleCard data={bundle} />
                  </Col>
                ))
              ) : (
                <p>No bundles matching this search</p>
              )}
            </Row>
          </section>
          <section className="p-section">
            <h2>Documentation</h2>
            <div>
              {docs.length ? (
                docs.map((doc: any) => (
                  <Col size={12} key={doc.id}>
                    <h3>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          {doc.title}
                        </a>
                      ) : (
                        doc.title
                      )}
                    </h3>
                    <HighlightText
                      text={doc?.post?.blurb}
                      searchTerm={search || ""}
                    />
                  </Col>
                ))
              ) : (
                <p>No matching documentation pages</p>
              )}
            </div>
          </section>
          <section className="p-section">
            <h2>Posts</h2>
            {topics.length ? (
              topics.map((post: any) => (
                <Col size={12} key={post.id}>
                  <h3>
                    <a
                      href={`https://discourse.charmhub.io/t/${post.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {post.title}
                    </a>
                  </h3>
                  <HighlightText
                    text={post?.post?.blurb}
                    searchTerm={search || ""}
                  />
                </Col>
              ))
            ) : (
              <p>No matching posts</p>
            )}
          </section>
        </div>
      ) : (
        <Row>
          <h3>Search all of charmhub</h3>
        </Row>
      )}
    </>
  );
}

const HighlightText = ({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm: string;
}) => {
  if (!searchTerm) return <p>{text}</p>;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return (
    <p>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <strong key={index}>{part}</strong>
        ) : (
          part
        )
      )}
    </p>
  );
};

const container = document.getElementById("main-content");
const root = createRoot(container as HTMLElement);
root.render(<App />);
