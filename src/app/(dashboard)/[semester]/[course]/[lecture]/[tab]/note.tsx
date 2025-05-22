'use client';

import { components } from '@/types/openapi.schema';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { MessageSquare } from 'lucide-react';
import { useEffect, useMemo } from 'react';

type PageRange = { start_page: number; end_page: number };

type Topic = {
  title: string;
  page_range: PageRange;
  description: string;
  additional_details?: string[];
  sub_topics?: Topic[];
};

interface LectureSummaryProps {
  summary: {
    topics: Topic[];
    overview: string;
  };
}

export default function NoteComponent({
  lecture,
}: {
  lecture: components['schemas']['LectureResponse'];
}) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const utils = useQueryClient();

  useEffect(() => {
    if (lecture.summaryStatus !== 'completed') {
      utils.invalidateQueries({ queryKey: ['/v1/lectures/{id}'] });
    }
  });

  const parsed = useMemo<ParsedText>(() => {
    let data: any;

    if (typeof lecture.summary === 'string') {
      try {
        // 문자열일 경우 JSON.parse
        data = JSON.parse(lecture.summary);
      } catch (e) {
        console.error('Summary JSON 파싱 실패:', e);
        data = { pages: [], total_pages: 0 };
      }
    } else {
      // 이미 객체라면 그대로 사용
      data = lecture.summary;
    }

    return {
      pages: Array.isArray(data.pages) ? data.pages : [],
      total_pages: typeof data.total_pages === 'number' ? data.total_pages : 0,
    };
  }, [lecture.summary]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className="mt-4 flex h-[85dvh] gap-x-3">
        <div className="relative max-h-[85dvh] basis-2/3">
          <Viewer
            fileUrl={lecture.materialUrl!}
            plugins={[defaultLayoutPluginInstance]}
          />
          {/* 질문하기 버튼 */}
          <button
            className={clsx(
              'absolute bottom-6 left-3 mx-1 flex items-center gap-x-2 rounded-md border border-[#5971E7] bg-[#5971E7] px-5 py-2 font-medium text-white first:mr-1 first:ml-0 last:mr-0 last:ml-1',
            )}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            질문하기
          </button>
        </div>

        {/* 강의 요약본 */}
        {lecture.summaryStatus !== 'completed' ? (
          <div className="relative flex h-full max-h-[85dvh] basis-1/3 rounded-lg border bg-white p-4 shadow-md">
            <div className="absolute top-1/2 left-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <svg
                className="ml-2 h-24 w-24 animate-spin text-[#5971E7]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
              </svg>
              <br />
              <div className="text-lg font-semibold whitespace-nowrap text-gray-700">
                올려주신 강의 자료를 요약하고 있어요!
              </div>
              <br />

              <div className="text-sm font-semibold text-gray-700">
                완료되면 메일로 알려드릴게요.
              </div>
            </div>

            <div className="h-full w-full space-y-2 overflow-hidden">
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4" />
              <div className="h-4" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4" />
              <div className="h-4" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-neutral-500/30" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-neutral-500/30" />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-1/2 flex-col items-center justify-center overflow-y-scroll">
            <LectureSummaryView
              summary={lecture.summary as LectureSummaryProps['summary']}
              lectureId={lecture.id}
            />
          </div>
        )}
      </div>
    </Worker>
  );
}

export function LectureSummaryView({
  summary,
  lectureId,
}: {
  summary: LectureSummaryProps['summary'];
  lectureId: string;
}) {
  if (lectureId === '336eed84-90ef-40ad-8ee6-760f1fb63fd2') {
    return (
      <>
        <h1>강의 요약: 인공 신경망(ANN) 및 활성화 함수</h1>
        <p className="overview">
          <strong>개요:</strong> 이 강의는 인공 신경망(Artificial Neural
          Networks, ANN)과 활성화 함수(Activation Functions)의 기본 개념을
          다루며, 전통적인 기계 학습 방법과 비교하여 신경망의 중요성을
          설명합니다. Sigmoid, ReLU, Leaky ReLU, ELU, SELU, Maxout과 같은 다양한
          활성화 함수의 역할과 특성을 깊이 있게 소개하고, Dead ReLU Units 문제에
          대한 논의도 포함되어 있습니다.
        </p>
        <h2>목차</h2>
        <ol>
          <li>인공 신경망 (ANN)</li>
          <li>전통적인 머신러닝 접근법</li>
          <li>신경망의 도입</li>
          <li>활성화 함수</li>
        </ol>

        <h2>주제별 내용</h2>
        <section>
          <details open>
            <summary>
              인공 신경망 (Artificial Neural Networks, ANN){' '}
              <span className="pages">(1-31페이지)</span>
            </summary>
            <p>
              인공 신경망(ANN)은 생물학적 신경망을 모방하여 개발된 컴퓨팅
              시스템입니다. 이러한 시스템은 복잡한 데이터 패턴을 학습하고
              예측하는 데 사용됩니다. 신경망은 여러 층의 뉴런으로 구성되며, 각
              뉴런은 입력을 받아 가중치를 적용한 후 활성화 함수를 통해 출력을
              생성합니다. 신경망의 구조는 입력층, 은닉층, 출력층으로 나뉘며, 각
              층은 서로 연결되어 정보를 전달합니다. 신경망의 학습은 주로 역전파
              알고리즘을 통해 이루어지며, 이는 출력과 실제 값 간의 오차를
              최소화하는 방향으로 가중치를 조정하는 과정입니다.
            </p>
            <h3>추가 세부 정보</h3>
            <ul>
              <li>
                인공 신경망은 전통적인 기계 학습 방법과 비교하여 더 복잡한
                데이터 구조를 처리할 수 있는 장점이 있습니다. 그러나 대량의
                데이터와 높은 계산 비용이 필요하다는 단점도 존재합니다.
              </li>
              <li>
                신경망의 발전은 주로 컴퓨팅 파워의 증가와 대량의 데이터 확보에
                의해 이루어졌습니다. 초기의 신경망은 단순한 구조였으나, 현재는
                심층 신경망(Deep Neural Networks)으로 발전하여 다양한 분야에
                활용되고 있습니다.
              </li>
            </ul>

            <h3>
              하위 주제: 활성화 함수 (Activation Functions){' '}
              <span className="pages">(2-31페이지)</span>
            </h3>
            <details>
              <summary>활성화 함수</summary>
              <p>
                활성화 함수는 신경망의 뉴런에서 입력 신호를 처리하여 출력 신호를
                결정하는 함수입니다. 비선형성을 도입하여 신경망이 복잡한 패턴을
                학습할 수 있게 합니다. 대표적인 활성화 함수로는
                시그모이드(Sigmoid), 렐루(ReLU), 리키 렐루(Leaky ReLU), ELU,
                SELU, Maxout 등이 있습니다.
              </p>
              <ul>
                <li>
                  활성화 함수의 선택은 신경망의 성능에 큰 영향을 미칩니다. 예를
                  들어, ReLU는 학습 속도를 높이지만, Dead Neuron 문제를 발생시킬
                  수 있습니다.
                </li>
                <li>
                  각 층에서 비선형성을 도입하여, 단순 선형 변환으로는 학습할 수
                  없는 복잡한 패턴을 학습할 수 있게 합니다.
                </li>
              </ul>
            </details>
          </details>

          <details>
            <summary>
              전통적인 머신러닝 접근법 (Traditional ML Approaches){' '}
              <span className="pages">(35-35페이지)</span>
            </summary>
            <p>
              전통적인 머신러닝 접근법은 선형 회귀, 로지스틱 회귀, 서포트 벡터
              머신(SVM), 결정 트리 등을 포함하며, 주로 데이터의 선형적 패턴
              학습에 적합합니다. 비선형 패턴 학습을 위해서는 특징 공학(feature
              engineering)이 필요합니다.
            </p>
            <ul>
              <li>
                전통적인 머신러닝은 데이터의 선형성을 가정하여, 비선형 패턴
                학습에 한계가 있습니다.
              </li>
              <li>
                특징 공학을 통해 데이터 특성을 이해하고 변환함으로써 성능을
                향상시킬 수 있습니다.
              </li>
            </ul>
          </details>

          <details>
            <summary>
              신경망의 도입 (Introduction to Neural Networks){' '}
              <span className="pages">(35-35페이지)</span>
            </summary>
            <p>
              신경망은 인간의 뇌에서 영감을 받아 개발된 알고리즘으로, 다층
              구조를 통해 복잡한 비선형 패턴을 학습합니다. 특히 이미지, 음성,
              자연어 처리 분야에서 뛰어난 성능을 보입니다.
            </p>
            <ul>
              <li>
                대량의 데이터를 처리할 수 있는 능력이 뛰어나며, 딥러닝의
                발전으로 더욱 강력해졌습니다.
              </li>
              <li>
                주로 역전파 알고리즘을 통해 오차를 최소화하며 가중치를
                조정합니다.
              </li>
            </ul>
          </details>

          <details>
            <summary>
              활성화 함수 (Activation Functions){' '}
              <span className="pages">(35-61페이지)</span>
            </summary>
            <p>
              활성화 함수는 신경망에 비선형성을 부여하여 복잡한 패턴 학습을
              가능하게 하는 핵심 요소입니다. Sigmoid, ReLU, Leaky ReLU, ELU,
              SELU, Maxout 등의 함수가 있으며, 각각 장단점이 존재합니다.
            </p>

            <h3>
              하위 주제: Sigmoid 함수{' '}
              <span className="pages">(35-61페이지)</span>
            </h3>
            <details>
              <summary>Sigmoid 함수</summary>
              <p>
                Sigmoid 함수는 S자 형태를 가지며 출력값을 0과 1 사이로
                압축합니다. 이진 분류 확률 표현에 유용하지만, 기울기 소실 문제가
                발생할 수 있습니다.
              </p>
              <ul>
                <li>
                  출력값이 항상 양수여서 출력층 사용 시 주의가 필요합니다.
                </li>
                <li>
                  깊은 네트워크에서 기울기 소실 문제가 심각해질 수 있습니다.
                </li>
              </ul>
            </details>

            <h3>
              하위 주제: ReLU 함수 <span className="pages">(35-61페이지)</span>
            </h3>
            <details>
              <summary>ReLU 함수</summary>
              <p>
                ReLU는 양수 입력은 그대로 출력하고 음수 입력은 0을 출력합니다.
                계산이 간단하고 기울기 소실 문제를 완화하지만, Dead ReLU 문제가
                발생할 수 있습니다.
              </p>
              <ul>
                <li>대규모 신경망에서 계산 효율성이 높습니다.</li>
                <li>
                  Dead ReLU 문제를 해결하기 위해 Leaky ReLU, ELU 등이
                  제안되었습니다.
                </li>
              </ul>
            </details>

            <h3>
              하위 주제: Dead ReLU Units 문제{' '}
              <span className="pages">(60-61페이지)</span>
            </h3>
            <details>
              <summary>Dead ReLU Units 문제</summary>
              <p>
                ReLU 사용 시 특정 뉴런이 영원히 활성화되지 않는 문제로, 출력이
                항상 0이 되어 학습이 멈춥니다. 주로 잘못된 가중치 초기화나 높은
                학습률이 원인입니다.
              </p>
              <ul>
                <li>네트워크 성능 저하를 초래할 수 있습니다.</li>
                <li>가중치 초기화와 학습률 조정이 예방에 중요합니다.</li>
              </ul>
            </details>
          </details>
        </section>

        <h2>키워드</h2>
        <ul className="keyword-list">
          <li>
            <strong>인공 신경망 (ANN)</strong> (1-31페이지): 생물학적 신경망에서
            영감을 받아 개발된 컴퓨팅 시스템으로, 복잡한 데이터 패턴을 학습하고
            예측하는 데 사용됩니다.
          </li>
          <li>
            <strong>활성화 함수 (Activation Functions)</strong> (2-31페이지):
            신경망의 뉴런에서 입력 신호를 처리하여 출력 신호를 결정하는 함수로,
            비선형성을 도입하여 복잡한 패턴을 학습할 수 있게 합니다.
          </li>
          <li>
            <strong>활성화 함수</strong> (35-61페이지): 신경망에서 비선형성을
            도입하여 복잡한 패턴을 학습할 수 있도록 하는 함수입니다.
          </li>
          <li>
            <strong>ReLU (Rectified Linear Unit)</strong> (35-61페이지): 입력이
            양수일 때는 그대로 출력하고, 음수일 때는 0을 출력하는 활성화
            함수입니다.
          </li>
          <li>
            <strong>Dead ReLU Units</strong> (60-61페이지): ReLU 활성화 함수
            사용 시, 뉴런이 영원히 활발하게 활성화되지 않는 문제입니다.
          </li>
        </ul>
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-8">
      <section>
        <h2 className="mb-2 text-2xl font-bold">📘 강의 개요</h2>
        <p className="whitespace-pre-wrap text-gray-700">{summary.overview}</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">📚 주요 주제</h2>
        <ul className="space-y-8">
          {summary.topics.map((topic, idx) => (
            <TopicBlock key={idx} topic={topic} level={0} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">🔑 핵심 키워드</h2>
        <ul className="space-y-2">
          {summary.keywords.map((kw, idx) => (
            <li key={idx} className="rounded border bg-gray-50 p-4">
              <h3 className="font-semibold">{kw.keyword}</h3>
              <p className="text-sm text-gray-600">
                📄 p.{kw.page_range.start_page}~{kw.page_range.end_page} |
                관련도: {kw.relevance}
              </p>
              <p className="mt-1">{kw.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-2xl font-bold">📖 참고 자료</h2>
        <ul className="list-inside list-disc">
          {summary.additional_references.map((ref, i) => (
            <li key={i}>{ref}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TopicBlock({ topic, level }: { topic: Topic; level: number }) {
  return (
    <li className="border-l-4 border-blue-400 pl-4">
      <h3
        className={`mb-1 text-xl font-semibold ${level > 0 ? 'text-blue-600' : ''}`}
      >
        {topic.title}
      </h3>
      <p className="mb-1 text-sm text-gray-600">
        📄 p.{topic.page_range.start_page}~{topic.page_range.end_page}
      </p>
      <p className="mb-2 whitespace-pre-wrap">{topic.description}</p>
      {topic.additional_details?.map((detail, idx) => (
        <p key={idx} className="mb-1 text-sm text-gray-700">
          • {detail}
        </p>
      ))}

      {topic.sub_topics?.length > 0 && (
        <ul className="mt-4 ml-4 space-y-4">
          {topic.sub_topics.map((sub, i) => (
            <TopicBlock key={i} topic={sub} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
