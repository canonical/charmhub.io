import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { Row, Col } from "@canonical/react-components";
import { TopicCard, LoadingCard } from "@canonical/store-components";

type Topic = {
  topic_id: number;
  name: string;
  slug: string;
  description: string;
  categories: Array<string>;
};

type Props = {
  topicsQuery: string | null;
};

function Topics({ topicsQuery }: Props) {
  const getTopics = async () => {
    const response = await fetch(`/topics.json?q=${topicsQuery}`);
    const data = await response.json();

    return {
      topics: data.topics.slice(0, 3),
    };
  };

  const { data, status, refetch, isFetching } = useQuery("topics", getTopics);

  useEffect(() => {
    refetch();
  }, [topicsQuery]);

  return (
    <>
      <h2 className="p-muted-heading">Top related topics</h2>

      <Row>
        {isFetching &&
          [...Array(3)].map((item, index) => (
            <Col size={3} key={index}>
              <LoadingCard height={180} />
            </Col>
          ))}

        {!isFetching &&
          status === "success" &&
          data.topics.length > 0 &&
          data.topics.map((topic: Topic) => (
            <TopicCard
              data={topic}
              truncateTitle
              truncateContent
              className="col-3 u-equal-height"
              key={topic.topic_id.toString()}
            />
          ))}
      </Row>

      <p>
        <a href="/topics">See all topics&nbsp;&rsaquo;</a>
      </p>
    </>
  );
}

export default Topics;
