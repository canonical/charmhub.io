import { Col, Row } from "@canonical/react-components";
import {
  BundleCard,
  CharmCard,
  LoadingCard,
} from "@canonical/store-components";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ICharm } from "../shared/types";

type DiscourseTopic = {
  id: string;
  url: string;
  title: string;
  post: { blurb: string };
};

function App() {
  const search = new URLSearchParams(window.location.search).get("q");
  const [loading, setLoading] = useState(true);

  const [term, setTerm] = useState(search || "");

  const [results, setResults] = useState({
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
          {search ? (
            <h1 className="p-heading--2">Search results for "{search}"</h1>
          ) : (
            <h1>Search Charmhub</h1>
          )}
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
      {search && (
        <div className="row">
          <section className="p-section">
            <h3>
              <a href={`/?type=charm&q=${search}`}>Charms &rsaquo;</a>
            </h3>
            <Row>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Col size={3} style={{ marginBottom: "1.5rem" }} key={i}>
                    <LoadingCard />
                  </Col>
                ))
              ) : charms.length ? (
                <>
                  {charms.map((charm: ICharm) => (
                    <Col
                      size={3}
                      style={{ marginBottom: "1.5rem" }}
                      key={charm?.package?.name}
                    >
                      <CharmCard data={charm} />
                    </Col>
                  ))}
                  <p>
                    Showing the top {charms.length} results for "{search}"
                  </p>
                </>
              ) : (
                <p>No charms matching this search</p>
              )}
            </Row>
          </section>
          <section className="p-section">
            <h3>
              <a href={`/?type=bundle&q=${search}`}>Bundles &rsaquo;</a>
            </h3>
            <Row>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Col size={3} style={{ marginBottom: "1.5rem" }} key={i}>
                    <LoadingCard />
                  </Col>
                ))
              ) : bundles.length ? (
                <>
                  {bundles.map((bundle: ICharm) => (
                    <Col
                      size={3}
                      style={{ marginBottom: "1.5rem" }}
                      key={bundle?.package?.name}
                    >
                      <BundleCard data={bundle} />
                    </Col>
                  ))}
                  <p>
                    Showing the top {bundles.length} results for "{search}"
                  </p>
                </>
              ) : (
                <p>No bundles matching this search</p>
              )}
            </Row>
          </section>
          <section className="p-section">
            <h3>
              <a href={`https://juju.is/docs/search?q=${search}`}>
                Documentation &rsaquo;
              </a>
            </h3>
            <div>
              {docs.length ? (
                docs.map((doc: DiscourseTopic) => (
                  <Col size={12} key={doc.id}>
                    <h5>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          {doc.title}
                        </a>
                      ) : (
                        doc.title
                      )}
                    </h5>
                    <p>{doc?.post?.blurb}</p>
                  </Col>
                ))
              ) : (
                <p>No matching documentation pages</p>
              )}
            </div>
          </section>
          <section className="p-section">
            <h3>
              <a href={`https://discourse.charmhub.io/search?q=${search}`}>
                Forum posts &rsaquo;
              </a>
            </h3>
            {topics.length ? (
              topics.map((topic: DiscourseTopic) => (
                <Col size={12} key={topic.id}>
                  <h5>
                    <a
                      href={`https://discourse.charmhub.io/t/${topic.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {topic.title}
                    </a>
                  </h5>
                  <p>{topic?.post?.blurb}</p>
                </Col>
              ))
            ) : (
              <p>No matching posts</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}

const container = document.getElementById("main-content");
const root = createRoot(container as HTMLElement);
root.render(<App />);
