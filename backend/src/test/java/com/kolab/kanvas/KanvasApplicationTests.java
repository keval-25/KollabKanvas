package com.kolab.kanvas;

import com.kolab.kanvas.repository.BoardRepository;
import com.kolab.kanvas.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class KanvasApplicationTests {

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private BoardRepository boardRepository;

    @MockBean
    private MongoTemplate mongoTemplate;

    @MockBean
    private MappingMongoConverter mappingMongoConverter;

    @MockBean
    private GridFsTemplate gridFsTemplate;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @Test
    void contextLoads() {
    }

}
